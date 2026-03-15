package com.jaydave.digital_wallet.dto;

public class CredentialResponse {

    private String id;
    private String type;
    private String issuerDid;
    private String subjectDid;
    private String issuedAt;

    public CredentialResponse(String id, String type, String issuerDid,
                              String subjectDid, String issuedAt) {
        this.id = id;
        this.type = type;
        this.issuerDid = issuerDid;
        this.subjectDid = subjectDid;
        this.issuedAt = issuedAt;
    }

    public String getId() { return id; }
    public String getType() { return type; }
    public String getIssuerDid() { return issuerDid; }
    public String getSubjectDid() { return subjectDid; }
    public String getIssuedAt() { return issuedAt; }
}
