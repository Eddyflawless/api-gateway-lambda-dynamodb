module.exports.statusCodes = {
    SUCCESS: 200,
    NOTFOUND: 404,
    INTERSERVERERROR: 500,
    BADREQUEST: 400,
}

module.exports.buildDynamoParams = (dynamodbParams, custom_params={}) => {

    return   { ...dynamodbParams, ...custom_params };

}

module.exports.matchPath = (event,method, path) => {

    if(event.httpMethod === method && event.path === path )  return true;
       
    return false
}

module.exports.buildResponse = (status, message) => {

    if(status >= 400){

        message = (message)? message : "Something went wrong";

        console.error(error, message);
    }

    if(status < 400)  message = JSON.stringify(message);

    return {
        statusCode: status,
        headers: {
            'Content-Type': 'application/json',
            body: message
        }
    }

}

module.exports.scanDynamoRecords = async (dynamodb, scanParams, itemArray) => {

    const dynamoData = await dynamodb.scan(scanParams).promise();
    itemArray = itemArray.concat(dynamoData.Items);

    if(dynamoData.LastEvaluatedKey){
        scanParams.ExclusiveStartKey = dynamoData.LastEvalutedKey;
        return await scanDynamoRecords(scanParams, itemArray);
    }

    return itemArray;


}

