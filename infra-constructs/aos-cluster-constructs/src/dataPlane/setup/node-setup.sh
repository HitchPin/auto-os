cd /etc/opensearch

mkdir /etc/maestro
echo 'ApiEndpoint: "%MAESTRO_ENDPOINT%"' >> /etc/maestro/config.yml
echo 'AwsRegion: "%REGION%"' >> /etc/maestro/config.yml

maestro download-root --out ca.pem
maestro issue-cert --server --client --usage "%OS_USAGE%"
maestro specialize-os-conf
mv -f ./pre-sec-plugin-opensearch.yml ./opensearch.yml
mv -f ./internal_users.yml ./opensearch-security/internal_users.yml
mv -f ./security.yml ./opensearch-security/config.yml
mv -f ./roles.yml ./opensearch-security/roles.yml
mv -f ./roles_mapping.yml ./opensearch-security/roles_mapping.yml
chown opensearch opensearch.yml final-opensearch.yml private.key public.pem ca.pem opensearch-security/*.yml
chmod 0600 opensearch.yml final-opensearch.yml private.key public.pem ca.pem opensearch-security/*.yml
systemctl enable opensearch
systemctl start opensearch
systemctl status opensearch

maestro issue-admin-cert

export OPENSEARCH_JAVA_HOME=/usr/share/opensearch/jdk
cd /usr/share/opensearch/plugins/opensearch-security/tools/
./securityadmin.sh \
    -h `cat /etc/hostname` \
    -cd /etc/opensearch/opensearch-security/ \
    -cacert /etc/opensearch/ca.pem \
    -cert /etc/opensearch/admin.pem \
    -key /etc/opensearch/admin.key -icl -nhnv -arc
cd /etc/opensearch
rm -f ./admin.pem
rm -f ./admin.key 
mv ./final-opensearch.yml ./opensearch.yml
systemctl restart opensearch
maestro register-instance