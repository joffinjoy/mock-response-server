### Developer Guide

---

#### Overview

This server provides a convenient way for developers to simulate an API with dummy request responses. By using configuration files, developers can define multiple routes, methods, request payloads, and corresponding mock responses. This setup is ideal for testing and development purposes, allowing developers to quickly mock endpoints and verify client applications without needing a fully implemented backend.

#### Configuration Files

Developers are expected to add their configuration files in the `routeConfigs` folder. Each configuration file can have any name and contain any number of API route configurations.

#### Sample Configuration

Below is an example of a configuration file (`sampleConfig.json`) that can be placed in the `routeConfigs` folder:

```json
{
	"routes": [
		{
			"route": "/auth/user/:userId/details/:detailId",
			"method": "POST",
			"requestData": {
				"greeting_message": "hello",
				"user_age": "<:userAge>",
				"transaction_id": "<:transactionId>",
				"session_token": "<:sessionToken>"
			},
			"returnData": {
				"user_id": "<:userId>",
				"detail_id": "<:detailId>",
				"user_age": "<:userAge>",
				"greeting_message": "<:greeting_message>",
				"session_token": "<:sessionToken>",
				"query_param1": "<:queryParam1>",
				"query_param2": "<:queryParam2>",
				"user_profile": {
					"profile_id": "<:transactionId>",
					"profile_details": {
						"contact_info": "<:sessionToken>",
						"preferences": [
							{ "<:userId>": "<:userId>" },
							{ "<:transactionId>": "<:transactionId>", "history": ["<:detailId>", "<:userId>"] },
							"<:sessionToken>"
						]
					}
				}
			}
		}
		//Another Configuration Here
	]
}
```

#### Adding Configuration Files

1. **Create a configuration file**: Add a new JSON file in the `routeConfigs` folder with any name.
2. **Define routes**: Add your route configurations in the JSON file following the structure of the sample configuration. Each configuration file can contain multiple route configurations.

#### Generating Curl Commands

After starting the server, curl commands for all the configured routes will be automatically generated and saved in the `curls` folder.

#### Finding Generated Curl Commands

1. **Navigate to the `curls` folder**: The curl commands for each configuration file will be saved as a `.txt` file in this folder.
2. **Locate your file**: Each configuration file in `routeConfigs` will have a corresponding `.txt` file in `curls` with the same base name.

#### Example Curl Command and Expected Output

Based on the sample configuration provided, a curl command might look like this:

```sh
# Command 1
curl -X POST "http://localhost:3000/auth/user/1234/details/5678" -H "Content-Type: application/json" -d '{
  "greeting_message": "hello",
  "user_age": 2764,
  "transaction_id": 4829,
  "session_token": 6532
}'
```

Expected output:

```json
{
	"user_id": 1234,
	"detail_id": 5678,
	"user_age": 2764,
	"greeting_message": "hello",
	"session_token": 6532,
	"query_param1": 8591,
	"query_param2": 3749,
	"user_profile": {
		"profile_id": 4829,
		"profile_details": {
			"contact_info": 6532,
			"preferences": [{ "1234": 1234 }, { "4829": 4829, "history": ["5678", "1234"] }, "6532"]
		}
	}
}
```

---

By following these steps, developers can easily add new API routes, generate mock responses, and create curl commands for testing, thus enabling effective simulation of server behavior for client application development.
