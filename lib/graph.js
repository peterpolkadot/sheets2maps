export default async function getGraphToken() {
  const tenant = process.env.AZURE_TENANT_ID;
  const client = process.env.AZURE_CLIENT_ID;
  const secret = process.env.AZURE_CLIENT_SECRET;

  const params = new URLSearchParams();
  params.append("client_id", client);
  params.append("client_secret", secret);
  params.append("scope", "https://graph.microsoft.com/.default");
  params.append("grant_type", "client_credentials");

  const res = await fetch(
    \`https://login.microsoftonline.com/\${tenant}/oauth2/v2.0/token\`,
    { method: "POST", body: params }
  );

  const json = await res.json();
  return json.access_token;
}