profile?=default
region?=eu-west-1

-include environments/config.mvars

ifndef bucket
$(error You must specify bucket parameter)
endif

## Package Cloud Formation template
package: src/template.yml src/app/main.js
	aws --profile $(profile) --region $(region) \
	cloudformation package \
		--template-file src/template.yml \
		--s3-bucket $(bucket) \
		--output-template-file template-output.yml

## Deploy Cloud Formation stack
deploy: package
	aws --profile $(profile) --region $(region) \
		cloudformation deploy \
		--template-file template-output.yml \
		--capabilities CAPABILITY_NAMED_IAM \
		--stack-name $(stack_name) \
		--parameter-overrides HostedZoneId=$(hostedZoneId) \
			RsDomain=$(rsDomain) \
			DynDnsUsername=$(dynDnsUsername) \
			DynDnsPassword=$(dynDnsPassword)

## Sam Local API
local:
	sam local start-api --region $(region) \
		-t src/template.yml \
		--parameter-overrides "ParameterKey=HostedZoneId,ParameterValue=$(hostedZoneId) \
			ParameterKey=RsDomain,ParameterValue=$(rsDomain) \
			ParameterKey=DynDnsUsername,ParameterValue=$(dynDnsUsername) \
			ParameterKey=DynDnsPassword,ParameterValue=$(dynDnsPassword)"
