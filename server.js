import json
import requests

def lambda_handler(event, context):
    urls = ["https://sit-iiq.us.lmco.com"]
    print(urls)
    for url in urls:
        try:
            response = requests.request("GET", url)
            response.raise_for_status()  # Raise an exception for HTTP errors (non-200 status codes)
            print(response)
        except requests.exceptions.RequestException as e:
            message = f"Error checking {url}: {str(e)}"
            print(message)
        except Exception as e:
            message = f"Unexpected error for {url}: {str(e)}"
            print(message)

    return {
        'statusCode': 200,
        'body': json.dumps('Monitoring completed.')
    }
