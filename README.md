## HTML5 Ambient Mode for Google Photos
An imitation of the Chromecast Google Photos 'ambient mode'.

The slideshow will run on any modern browser.

A serverless authorisation API is also provided to enable ease of use on limited input devices.
As of writing, Google's own limited input auth solution does not include the Google Photos API scope.

Interestingly, the auth API implementation here can be used for any number of limited input
services under a single Google API credential.

The security implications of this are questionable, as this auth server enables any 3rd party to
obtain Google access tokens from it by imitating a limited input device IF they can trick the
user into authorising it...

#### Requirements
- AWS account
- AWS CLI
- Google Photos API credentials
- nodejs
- serverless CLI

#### Run auth API e2e tests
```
cd auth
npm test
```

#### Deploy your own
```
cp default.serverless.env.yml serverless.env.yml
# Add configuration to serverless.env.yml
cd auth
# Deploy the serverless auth API.
sls deploy --stage dev/prod
# Make note of the lambda function URL
# this is your auth API endpoint for the static HTML pages we will now deploy

cd ../web
# Add configuration to .env, including the auth endpoint API from above step
# Deploy the S3 bucket used for static site hosting fronted by a Cloudfront distribution
# (Google requires that the Referrer for an API request is an HTTPS endpoint, Cloudfront is required for SSL)
sls deploy --stage dev/prod
# Deploy the static HTML photo slideshow and external auth endpoints
./upload-site.sh --stage dev/prod
# Retreive the CloudFront distribution endpoint; it is the HTTPS access point to the static S3 pages
sls info --verbose
# You can either:
# - use this endpoint as is
# - add it as a CNAME to another domain configured for SSL use in Route 53 (Set the chosen domain to 
# provider.environment.ENDPOINT so that is configured as an alias for the CloudFront distrobution)
# 
# The chosen endpoint must be added to the Google API configuration:
# - Authorised JavaScript origin: https://<web.dev/prod.endpoint>
# - Authorised redirect URI: https://<provider.environment.G_AUTH_CALLBACK>/auth.html
```
