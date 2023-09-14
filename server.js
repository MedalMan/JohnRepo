import boto3
import json
import re
import datetime

# Initialize AWS clients
cloudwatchlogs = boto3.client('logs', region_name='YOUR_REGION')
sns = boto3.client('sns', region_name='YOUR_REGION')

# Define your CloudWatch Log Group and Log Stream
log_group_name = '/aws/lambda/your-lambda-function-name'
log_stream_name = 'your-log-stream-name'

# Define your SNS Topic ARN
sns_topic_arn = 'arn:aws:sns:YOUR_REGION:YOUR_ACCOUNT_ID:YourSNSTopic'

# Function to fetch the latest log events from CloudWatch Logs
def fetch_latest_log_events():
    try:
        response = cloudwatchlogs.get_log_events(
            logGroupName=log_group_name,
            logStreamName=log_stream_name,
            limit=1,
            startFromHead=True
        )
        
        if 'events' in response and len(response['events']) > 0:
            return response['events'][0]['message']
        else:
            return None
    except Exception as e:
        print(f"Error fetching log events: {str(e)}")
        return None

# Function to send a notification using SNS
def send_notification(message):
    try:
        sns.publish(
            TopicArn=sns_topic_arn,
            Message=message,
            Subject="Certificate Expiration Alert"
        )
        print("Notification sent successfully.")
    except Exception as e:
        print(f"Error sending notification: {str(e)}")

# Function to check certificate expiration based on log event content
def check_certificate_expiration(log_event):
    try:
        # Parse the log event or use a regular expression to extract certificate info
        # For example, you can use regex to extract the certificate expiration date

        # Example regex pattern for extracting certificate expiration date (adjust as needed)
        expiration_pattern = r'Certificate Expiration Date: (\d{4}-\d{2}-\d{2})'

        match = re.search(expiration_pattern, log_event)
        if match:
            expiration_date_str = match.group(1)
            expiration_date = datetime.datetime.strptime(expiration_date_str, '%Y-%m-%d').date()
            current_date = datetime.date.today()

            # Define your certificate expiration threshold (e.g., 30 days)
            threshold_days = 30

            # Calculate the remaining days until certificate expiration
            days_until_expiration = (expiration_date - current_date).days

            if days_until_expiration <= threshold_days:
                notification_message = f"Certificate is about to expire in {days_until_expiration} days."
                send_notification(notification_message)
            else:
                print("Certificate is not close to expiration.")
        else:
            print("Certificate expiration date not found in log event.")
    except Exception as e:
        print(f"Error checking certificate expiration: {str(e)}")

# Main function to check certificate expiration
def main():
    try:
        latest_log_event = fetch_latest_log_events()
        if latest_log_event:
            check_certificate_expiration(latest_log_event)
        else:
            print("No log events found.")
    except Exception as e:
        print(f"Error: {str(e)}")

# Run the certificate expiration check
if __name__ == '__main__':
    main()
