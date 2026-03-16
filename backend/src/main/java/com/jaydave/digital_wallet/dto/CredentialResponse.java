package com.jaydave.digital_wallet.dto;

import java.util.Map;

public class CredentialResponse {

    private String id;
    private String type;
    private String issuer;
    private String subject;
    private String issuerDid;
    private String subjectDid;
    private String issuedAt;
    private boolean revoked;
    private Map<String, Object> claims;

    public CredentialResponse(String id, String type, String issuer, String subject,
                              String issuerDid, String subjectDid, String issuedAt,
                              boolean revoked, Map<String, Object> claims) {
        this.id = id;
        this.type = type;
        this.issuer = issuer;
        this.subject = subject;
        this.issuerDid = issuerDid;
        this.subjectDid = subjectDid;
        this.issuedAt = issuedAt;
        this.revoked = revoked;
        this.claims = claims;
    }

    public String getId() { return id; }
    public String getType() { return type; }
    public String getIssuer() { return issuer; }
    public String getSubject() { return subject; }
    public String getIssuerDid() { return issuerDid; }
    public String getSubjectDid() { return subjectDid; }
    public String getIssuedAt() { return issuedAt; }
    public boolean isRevoked() { return revoked; }
    public Map<String, Object> getClaims() { return claims; }
}
