const AWS = require("aws-sdk");

AWS.config.update({
    region: 'us-east-2'
});

const { scanDynamoRecords, matchPath, buildResponse, buildDynamoParams, statusCodes } = require("./common");

const dynamodb = new AWS.dynamoDB.DocumentClient();
const dynamodbTableName = 'demoapi';
const dynamodbParams = {
    TableName: dynamodbTableName,
}

const userPath = "/user";
const usersPath = "/users";


async function router(event){

    console.log("Request event", event);

    let response = null;

    switch(true){

        case matchPath(event,"GET", userPth):
            response = await getUser(event.queryStringParameters.id);
            break;

        case matchPath(event,"GET", usersPath):
            response = await getUsers();
            break;

        case matchPath(event,"POST", userPath):
            response = await createUser(JSON.parse(event.body));
            break;

        case matchPath(event,"PATCH", userPath):
            response = await updateUser(JSON.parse(event.body));
            break;
        default:
            response = buildResponse(statusCodes.NOTFOUND, "404 Not Found");    

    }

    return response;

}


async function getUsers(){
    try{

        let params = buildDynamoParams(dynamodbParams);

        const all_users = await scanDynamoRecords(params, []);

        return buildResponse(statusCodes.SUCCESS, { users: all_users });

    }catch(error){
        return buildResponse(statusCodes.INTERSERVERERROR, error);
    }
}

async function getUser(id){

    let params = buildDynamoParams(dynamodbParams,{ 'id': id} );

    try{

        var response = await dynamodb.get(params).promise();

        if(respponse) return buildResponse(statusCodes.SUCCESS, response.Item);

    }catch(error){
        buildResponse(statusCodes.INTERSERVERERROR, error)
    }

}

async function createUser(requestBody){

    try{

        let params = buildDynamoParams(dynamodbParams,{ Item: requestBody } );

        await dynamodb.put(params).promise();

        return buildResponse(statusCodes.SUCCESS, { Operation: "SAVE", Message: "SUCCESS", Item: requestBody});

    }catch(error){
        return buildResponse(statusCodes.INTERSERVERERROR, error);
    }

}

async function updateUser({id, updateKey, updateValue}){
    try{

        let params = buildDynamoParams(dynamodbParams,{ 
            Key: {
                'id': id
            },
            UpdateExpression: `set ${updateKey} = :value`,
            ExpressionAttributeValues: {
                ':value': updateValue
            }, 
            ReturnValues: 'UPDATED_NEW'
         } );

        var response =  await dynamodb.update(params).promise();

        const body = {
            Operation: 'UPDATE', 
            Message: 'SUCCESS',
            UpdatedAttributes: response
        }

        return buildResponse(statusCodes.SUCCESS, body);

    }catch(error){

        return buildResponse(statusCodes.INTERSERVERERROR, error);
        
    }

}

exports.handler = async (event) => {

    response = await router();

    return response;
};
