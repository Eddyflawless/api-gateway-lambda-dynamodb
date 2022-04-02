#!/bin/bash
template="api-gw-lambda-dynamodb.json"

stack_name="my-api-gw-lambda-dynamodb-stack"

function manual(){
    echo ""
    echo -e "Usage: $0 <command> eg: $0 create_stack\n"
    echo "Available commands: "
    echo -e "1. create_stack \n2. tear_down_stack \n3. update_stack\n"
    echo -e "Options:\n"
    echo -e "create_stack\n This command creates the stack specified in the template variable\n"
    echo -e "tear_down_stack\n This command tears down the stack by the stack name\n"
     echo -e "update_stack\n This command updates the already created stack set\n"
}

function info(){
    echo "-----------------------"
    echo -e "$1"
    echo "-----------------------"
}

function pre_check(){

    command -v aws > /dev/null || printf "aws cli wasnot found. Visit https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html \n "
    
    if [[ ! -f $template ]]; then
        info "Cannot find specified template of $template"
        exit
    fi

    #aws cloudformation create-stack  --stack-name  $1
}

function create_stack(){
        
    info "Attempting stack $stack_name creation with $(basename $template) template...."

    aws cloudformation create-stack  --stack-name $stack_name \
     --template-body file://$template --capabilities CAPABILITY_NAMED_IAM
}

function tear_down_stack(){

    info "Going to tear down stack $stack_name now...."

    aws cloudformation delete-stack --stack-name $stack_name
}

function update_stack(){

        info "Attempting to update stack  $stack_name with $(basename $template) template...."

        aws cloudformation update-stack --stack-name $stack_name --template-body file://$template  \ 
        --capabilities CAPABILITY_NAMED_IAM

}


pre_check

if [[ -z "$1" ]]; then
    manual
    exit
fi

command_fn=$1

command -v "$command_fn" > /dev/null

if [[ $? -gt 0 ]]; then
    manual
    exit
fi


eval "$command_fn"

