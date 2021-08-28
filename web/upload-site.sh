#!/bin/sh
export SLS_WARNING_DISABLE='*'
export SLS_DEPRECATION_DISABLE='*'
echo -n Resolving environment variables
PROFILE=$(sls print $@ --path provider.profile)
echo -n .
ENDPOINT=$(sls print $@ --path provider.environment.ENDPOINT)
#echo $ENDPOINT
echo -n .
AUTH_URI=$(sls print $@ --path provider.environment.AUTH_URI)
#echo $AUTH_URI
echo -n .
SYNC_URL=$(sls print $@ --path provider.environment.SYNC_URL)
#echo $SYNC_URL
echo -n .
CODE_URL=$(sls print $@ --path provider.environment.CODE_URL)
#echo $CODE_URL
echo -n .
CHECK_URL=$(sls print $@ --path provider.environment.CHECK_URL)
#echo $CHECK_URL
echo -n .
G_MEDIA_API=$(sls print $@ --path provider.environment.G_MEDIA_API)
#echo $G_MEDIA_API
echo .
echo

unset SLS_WARNING_DISABLE
unset SLS_DEPRECATION_DISABLE

echo -n Uploading static files

sed -e "s;\${ENDPOINT};${ENDPOINT};g" \
    -e "s;\${AUTH_URI};${AUTH_URI};g" \
    -e "s;\${SYNC_URL};${SYNC_URL};g" \
    -e "s;\${CHECK_URL};${CHECK_URL};g" \
    -e "s;\${G_MEDIA_API};${G_MEDIA_API};g" index.html | \
aws s3 cp - s3://$ENDPOINT/index.html --content-type=text/html --cache-control=no-cache --acl=public-read --profile $PROFILE
echo -n .

sed -e "s;\${CODE_URL};${CODE_URL};g" \
    -e "s;\${G_MEDIA_API};${G_MEDIA_API};g" auth.html | \
aws s3 cp - s3://$ENDPOINT/auth.html --content-type=text/html --cache-control=no-cache --acl=public-read --profile $PROFILE
echo .
echo Done

