cd /etc/opensearch

mkdir /etc/maestro
echo 'ApiEndpoint: "%MAESTRO_ENDPOINT%"' >> /etc/maestro/config.yml
echo 'AwsRegion: "%REGION%"' >> /etc/maestro/config.yml

set -Eeuo pipefail

function handle_error() {
  # Get information about the error
  local error_code=$?
  local error_line=$BASH_LINENO
  local error_command=$BASH_COMMAND

  # Log the error details
  local debug_msg="Error occurred on line $error_line: $error_command (exit code: $error_code)"
  printf -v debugmsg "%q\n" "Error occurred on line $error_line: $error_command (exit code: $error_code)"
  maestro signal-init-fail --debug "$debugmsg"
  exit 1
}

trap handle_error ERR

maestro download-root --out ca.pem
cp ./ca.pem /etc/pki/ca-trust/source/anchors/
update-ca-trust
maestro issue-cert --server --client --usage "%OS_USAGE%"
maestro specialize-os-conf
rm ./pre-sec-plugin-opensearch.yml
mv ./final-opensearch.yml ./opensearch.yml
mv ./internal_users.yml ./opensearch-security/internal_users.yml
mv ./security.yml ./opensearch-security/config.yml
mv ./roles.yml ./opensearch-security/roles.yml
mv ./roles_mapping.yml ./opensearch-security/roles_mapping.yml
chown opensearch opensearch.yml private.key public.pem ca.pem opensearch-security/*.yml
chmod 0600 opensearch.yml private.key public.pem ca.pem opensearch-security/*.yml
systemctl enable opensearch
systemctl start opensearch
systemctl status opensearch

maestro issue-admin-cert

export OPENSEARCH_JAVA_HOME=/usr/share/opensearch/jdk
cd /usr/share/opensearch/plugins/opensearch-security/tools/
./securityadmin.sh \
    -cd /etc/opensearch/opensearch-security/ \
    -cacert /etc/opensearch/ca.pem \
    -cert /etc/opensearch/admin.pem \
    -key /etc/opensearch/admin.key -icl -nhnv --accept-red-cluster
cd /etc/opensearch
rm ./admin.pem
rm ./admin.key
systemctl restart opensearch
maestro register-instance