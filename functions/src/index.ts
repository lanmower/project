import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(functions.config().gemini.apikey);

interface AICriteria {
  id: string;
  name: string;
  prompt: string;
  expectedFormat: string;
  isActive?: boolean;
}

interface AICriteriaResult {
  criteriaId: string;
  criteriaName: string;
  result: any;
}

interface EmailRule {
  id: string;
  name: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  isActive: boolean;
}

interface RuleCondition {
  field: string;
  operator: string;
  value: any;
  criteriaId?: string;
}

interface RuleAction {
  type: string;
  params: Record<string, any>;
}

async function evaluateAICriteria(emailContent: string, criteria: AICriteria): Promise<any> {
  const prompt = `
    Analyze this email content according to the following criteria:
    ${criteria.prompt}

    Email Content:
    ${emailContent}

    Provide your response in this format:
    ${criteria.expectedFormat}
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    try {
      // Try to parse as JSON if expectedFormat is JSON
      if (criteria.expectedFormat.toLowerCase().includes('json')) {
        return JSON.parse(text);
      }
      // Otherwise return raw text
      return text;
    } catch (parseError) {
      console.error(`Error parsing AI response for criteria ${criteria.id}:`, parseError);
      return text; // Return raw text if JSON parsing fails
    }
  } catch (error) {
    console.error(`Error evaluating AI criteria ${criteria.id}:`, error);
    throw new functions.https.HttpsError('internal', `AI evaluation failed: ${error.message}`);
  }
}

interface ProcessedEmail {
  body: string;
  subject: string;
  from: string;
  to: string[];
  timestamp: Date;
  [key: string]: any;
}

export const processEmail = functions.firestore
  .document('emails/{emailId}')
  .onCreate(async (snap, context) => {
    const email = snap.data() as ProcessedEmail;
  try {
    // Process attachments if present
    let processedAttachments: Array<{url: string; type: string}> = [];
    if (email.attachments && Array.isArray(email.attachments)) {
      processedAttachments = await Promise.all(
        email.attachments.map(async (attachment: any) => {
          // Store attachment in Firebase Storage or process as needed
          return {
            url: attachment.url,
            type: attachment.type
          };
        })
      );
    }

    const emailContent = `
Subject: ${email.subject}
From: ${email.from}
Body: ${email.body}
    `.trim();

  // Get all active AI criteria
  const criteriaSnapshot = await db.collection('aiCriteria').get();
  const allCriteria = criteriaSnapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    .filter(criteria => criteria.isActive) as AICriteria[];

  // Evaluate email against all AI criteria
  const aiCriteriaResults = await Promise.all(
    allCriteria.map(async (criteria) => ({
      criteriaId: criteria.id,
      criteriaName: criteria.name,
      result: await evaluateAICriteria(emailContent, criteria)
    }))
  );

  // Process rules with AI criteria support
  const rulesSnapshot = await db.collection('rules')
    .where('isActive', '==', true)
    .get();

  const rules = rulesSnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as EmailRule[];

  const appliedRules = rules.filter(rule => 
    rule.conditions.every(condition => {
      if (condition.field === 'ai-criteria') {
        const criteriaResult = aiCriteriaResults.find(
          r => r.criteriaId === condition.criteriaId
        );
        if (!criteriaResult?.result) return false;

        // Compare the AI result against the condition
        return evaluateCondition(criteriaResult.result, condition);
      }

      // Previous condition evaluation logic remains...
      return evaluateStandardCondition(email, condition);
    })
  );

  // Handle the applied rules
  const actionResults = await Promise.allSettled(
    appliedRules.flatMap(rule => 
      rule.actions.map(action => executeAction(action, email))
    )
  );

  // Log any failed actions
  actionResults.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Action ${index} failed:`, result.reason);
    }
  });

  // Store the results
  await db.collection('processedEmails').doc(context.params.emailId).set({
    ...email,
    aiResults: aiCriteriaResults,
    appliedRules: appliedRules.map(rule => rule.id),
    processedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return null;
});

function evaluateCondition(result: any, condition: RuleCondition): boolean {
  switch (condition.operator) {
    case 'equals':
      return result === condition.value;
    case 'contains':
      return String(result).includes(String(condition.value));
    case 'greaterThan':
      return Number(result) > Number(condition.value);
    case 'lessThan':
      return Number(result) < Number(condition.value);
    default:
      return false;
  }
}

function evaluateStandardCondition(email: ProcessedEmail, condition: RuleCondition): boolean {
  const value = condition.field.includes('.')
    ? condition.field.split('.').reduce((obj, key) => obj?.[key], email)
    : email[condition.field];
  return evaluateCondition(value, condition);
}

async function executeAction(action: RuleAction, email: ProcessedEmail): Promise<void> {
  const MAX_RETRY = 3;
  const RETRY_DELAY = 1000; // 1 second

  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    try {
      switch (action.type) {
        case 'label':
          await addLabel(email, action.params.label);
          break;
        case 'assign':
          await assignEmail(email, action.params.userId);
          break;
        case 'forward':
          await forwardEmail(email, action.params.to);
          break;
        case 'notify':
          await sendNotification(action.params.userId, action.params.message);
          break;
        default:
          console.warn(`Unknown action type: ${action.type}`);
      }
      return;
    } catch (error) {
      if (attempt === MAX_RETRY) {
        throw new Error(`Action ${action.type} failed after ${MAX_RETRY} attempts: ${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
    }
  }
}

async function addLabel(email: ProcessedEmail, label: string): Promise<void> {
  await db.collection('processedEmails').doc(email.id).update({
    labels: admin.firestore.FieldValue.arrayUnion(label)
  });
}

async function assignEmail(email: ProcessedEmail, userId: string): Promise<void> {
  await db.collection('processedEmails').doc(email.id).update({
    assignedTo: admin.firestore.FieldValue.arrayUnion(userId),
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function forwardEmail(email: ProcessedEmail, to: string): Promise<void> {
  // Implement email forwarding logic using your email service
  console.log(`Forwarding email to ${to}`);
  // TODO: Implement actual email forwarding
}

async function sendNotification(userId: string, message: string): Promise<void> {
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    throw new Error(`User ${userId} not found`);
  }

  // Add notification to user's notifications collection
  await db.collection('users').doc(userId)
    .collection('notifications')
    .add({
      message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    });
}
