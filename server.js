const AWS = require('aws-sdk');
const sns = new AWS.SNS({ region: 'your-aws-region' });
const cloudwatchlogs = new AWS.CloudWatchLogs({ region: 'your-aws-region' });

// Define the CloudWatch Log Group and Stream for your certificate logs
const logGroupName = '/aws/lambda/your-lambda-function-name';
const logStreamName = 'your-log-stream-name';

// Define the SNS Topic ARN for sending notifications
const snsTopicArn = 'your-sns-topic-arn';

// Function to fetch the latest log events from CloudWatch Logs
async function fetchLatestLogEvents() {
  const params = {
    logGroupName: logGroupName,
    logStreamName: logStreamName,
    limit: 1,
    startFromHead: true,
  };

  const response = await cloudwatchlogs.getLogEvents(params).promise();
  if (response.events.length > 0) {
    return response.events[0].message;
  } else {
    return null;
  }
}

// Function to send a notification using SNS
async function sendNotification(message) {
  const params = {
    Message: message,
    TopicArn: snsTopicArn,
  };

  try {
    const publishResponse = await sns.publish(params).promise();
    console.log(`Notification sent: MessageId - ${publishResponse.MessageId}`);
  } catch (error) {
    console.error(`Error sending notification: ${error.message}`);
  }
}

// Main function to check certificate expiration
async function checkCertificateExpiration() {
  try {
    const latestLogEvent = await fetchLatestLogEvents();
    if (latestLogEvent) {
      // Parse and check the log event for certificate expiration
      // You can implement your logic here based on the log content
      // For example, check for certificate expiration date and time

      // If certificate is about to expire, send a notification
      if (/* Your certificate expiration check logic */) {
        await sendNotification('Certificate is about to expire!');
      }
    }
  } catch (error) {
    console.error(`Error checking certificate expiration: ${error.message}`);
  }
}

// Run the certificate expiration check periodically
setInterval(checkCertificateExpiration, /* Specify your interval in milliseconds */);
