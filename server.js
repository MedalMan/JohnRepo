import json
import requests

def lambda_handler(event, context):
    urls = ["https://sit-iiq.us.lmco.com"]
    print(urls)
    for url in urls:
        try:
            response = requests.request("GET", url)
            print(response)
            if response.status_code != 200:
                message = f"Site {url} returned {response.status_code} status code"
                print('ok')
                print(message)
        except Exception as e:
            message = f"Error checking {url}: {str(e)}"
            print(message)

    return {
        'statusCode': 200,
        'body': json.dumps('Monitoring completed.')
    }
