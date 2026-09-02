/**
 * Simulated Email Notification Service for FitCheck
 * Logs mock email transmissions to the developer console with styling and structures.
 */

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  type: "outbid" | "purchase_finalized";
}

export const emailNotificationService = {
  sendEmail: (payload: EmailPayload) => {
    const timestamp = new Date().toLocaleString();
    
    console.log(
      `%c 📬 FITCHECK MAILBOX ENGINE: Simulated Email Routed to Server at ${timestamp} `,
      "background: #1C1A17; color: #FAF9F5; border-radius: 4px; padding: 5px 10px; font-weight: bold; font-family: monospace; border-left: 4px solid #AF8B50;"
    );
    console.log(
      `%cTO:      %c${payload.to}\n%cSUBJECT: %c${payload.subject}\n%cCONTENT:\n%c${payload.body}`,
      "color: #877F70; font-family: monospace; font-weight: bold;",
      "color: #1C1A17; font-family: monospace; font-weight: bold; text-decoration: underline;",
      "color: #877F70; font-family: monospace; font-weight: bold;",
      "color: #E61601; font-family: monospace; font-weight: bold;",
      "color: #877F70; font-family: monospace; font-weight: bold;",
      "color: #2E2B25; font-family: Georgia, serif; line-height: 1.5; padding: 10px; background-color: #FCFBF8; border-left: 3px solid #AF8B50; display: block; margin-top: 5px;"
    );
    console.log(
      `%c────────────────────────────────────────────────────────────────────────────────`,
      "color: #AF8B50; font-weight: bold;"
    );
  },

  notifyOutbid: (recipientEmail: string, bidderName: string, itemTitle: string, newBidAmount: number) => {
    const body = `
Dear FitCheck Curator / Valued Collector,

Your bid on our archived lot has been exceeded.

📍 Piece Sourced: "${itemTitle}"
🔥 Elevated Bid Price: ₦${newBidAmount.toLocaleString()}
👤 Bidder Signature Identifier: ${bidderName}

To protect your provenance claim or place a counter-bid, return to the live showroom immediately.

Yours in craft,
FitCheck Automated Ledger
    `.trim();

    emailNotificationService.sendEmail({
      to: recipientEmail,
      subject: `⚠️ Live Outbid Notice: "${itemTitle}" on FitCheck`,
      body,
      type: "outbid"
    });
  },

  notifyPurchaseFinalized: (recipientEmail: string, buyerName: string, itemTitle: string, price: number, transactionId: string) => {
    const body = `
Dear ${buyerName},

Acquisition Accomplished!

We are pleased to confirm that this item has been secured in your personal vault.

📦 Item: "${itemTitle}"
💵 Price: ₦${price.toLocaleString()}
🧾 Transaction ID: ${transactionId}
🚚 Status: Preparing Courier Packaging

Thank you for choosing FitCheck.

Best regards,
FitCheck Ltd.
    `.trim();

    emailNotificationService.sendEmail({
      to: recipientEmail,
      subject: `🎉 Transaction Completed: "${itemTitle}" Secured on FitCheck`,
      body,
      type: "purchase_finalized"
    });
  }
};
