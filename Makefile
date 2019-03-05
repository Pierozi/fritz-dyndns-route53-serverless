profile?=default
region?=eu-west-1

-include environments/config.mvars

ifndef bucket
$(error You must specify bucket parameter)
endif

## Package Cloud Formation template
template-output.yml: src/template.yml
	aws --profile $(profile) --region $(region) \
	cloudformation package \
		--template-file src/template.yml \
		--s3-bucket $(bucket) \
		--output-template-file template-output.yml

## Deploy Cloud Formation stack
deploy: template-output.yml
	aws --profile $(profile) --region $(region) \
		cloudformation deploy \
		--template-file template-output.yml \
		--capabilities CAPABILITY_NAMED_IAM \
		--stack-name $(stack_name) \
		--parameter-overrides DomainName=$(domainName) \
			DynDnsUsername=$(dynDnsUsername) \
			DynDnsPassword=$(dynDnsPassword)

## Sam Local API
local:
	sam local start-api --region $(region) -t src/template.yml
