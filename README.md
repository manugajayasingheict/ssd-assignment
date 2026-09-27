# Secure Software Development Assignment

## Project

**Application:** Logical ICT Web Application

**Original Project:**

**Modified Project:** https://github.com/manugajayasingheict/ssd-assignment.git

**YouTube Video:**

---

# Group Members and Contributions

## Member 1 — Panditha S.D (IT23357976)

### 1. Batch Data Exposure

**OWASP Category:** A01 – Broken Access Control

**Issue:**
Authenticated students could access batch documents belonging to other batches because the original Firestore rules allowed any authenticated user to read batch data.

**Work:**
Implemented Firestore authorization so that students can only read their own assigned batch, while administrators can access batch data as required.

---

### 2. Sensitive Document Exposure

**OWASP Category:** A01 – Broken Access Control

**Issue:**
Sensitive student documents such as NIC images and payment slips could be accessed through persistent download URLs without sufficient authorization enforcement.

**Work:**
Implemented Firebase Storage security rules and changed the application to use authenticated access to sensitive files with temporary object URLs instead of exposing persistent sensitive download URLs.

---

### 3. Google OAuth / OpenID Connect Security Enhancement

**OWASP Category:** A07 – Identification and Authentication Failures

**Type:** Security Enhancement

**Work:**
Enhanced the existing Google authentication flow by requesting the appropriate Google identity scopes (`openid`, `profile`, and `email`), verifying that the authenticated account is a Google account with a verified email address, and securely recording the authentication-provider information during user provisioning.

Identity-provider-related fields are also protected from unauthorized modification through Firestore rules.

---

## Member 2 — M.U.D Gunatilake (IT23215924)

### 1. Enrollment Approval Bypass

**OWASP Category:** A01 – Broken Access Control

**Issue:**
A student could manipulate the enrollment process and attempt to create or modify an enrollment with an unauthorized approval status.

**Work:**
Implemented authorization rules so that students can create enrollments only with the permitted initial state, while approval and rejection operations are restricted to authorized administrators.

---

### 2. Enrollment Tampering

**OWASP Category:** A01 – Broken Access Control

**Issue:**
Students could attempt to modify security-sensitive enrollment fields such as student identity, batch, class information, month, or enrollment status.

**Work:**
Implemented Firestore rules to restrict modification of protected enrollment fields and ensure that security-sensitive enrollment information cannot be freely changed by students.

---

## Member 3 — A.V Hettige (IT23168640)

### 1. Email Verification Status Tampering

**OWASP Category:** A01 – Broken Access Control

**Issue:**
The application relied on a user-controlled Firestore field for email verification status, creating a possibility for a student to manipulate their verification state.

**Work:**
Protected verification-related user information from unauthorized modification and separated security-sensitive identity information from normal user-editable profile information.

---

### 2. Coding Lab JavaScript Execution

**OWASP Category:** A03 – Injection

**Issue:**
The Coding Lab preview allowed JavaScript contained in user-provided HTML to execute within the preview environment without sufficient isolation.

**Work:**
Isolated the Coding Lab preview using a sandboxed iframe so that JavaScript execution is restricted to the intended isolated environment.

---

### 3. Student → Admin Privilege Escalation

**OWASP Category:** A01 – Broken Access Control

**Issue:**
A student could attempt to modify their user information and change the security-sensitive `role` field to obtain administrator privileges.

**Work:**
Restricted modification of authorization-sensitive user fields so that students cannot change their own role and grant themselves administrator privileges.

---

### 4. Student Batch Manipulation

**OWASP Category:** A01 – Broken Access Control

**Issue:**
A student could attempt to modify their assigned batch through their user profile.

**Work:**
Restricted unauthorized modification of the batch field so that students cannot change their security-sensitive batch assignment themselves.

---

## Member 4 — Geenth E.A.M (IT22894106)

### 1. NIC Image File-Signature Validation

**OWASP Category:** A04 – Insecure Design

**Issue:**
NIC image uploads relied primarily on file-related information supplied by the client instead of sufficiently validating the actual file content.

**Work:**
Implemented file-signature (magic-byte) validation to verify that uploaded NIC files actually correspond to the expected image file types rather than trusting the client-provided file extension or MIME type alone.

---

### 2. Pyodide CDN SRI Protection

**OWASP Category:** A08 – Software and Data Integrity Failures

**Issue:**
The application loaded the Pyodide JavaScript resource from a CDN without Subresource Integrity protection.

**Work:**
Added Subresource Integrity (SRI) protection to the external Pyodide resource so that the browser can verify the integrity of the downloaded script before executing it.

---

# OAuth / OpenID Connect Enhancement

The application already contained Google authentication. The security enhancement improved the existing authentication implementation rather than claiming that OAuth was implemented from scratch.

The enhanced authentication flow includes:

```text
Google Account
      ↓
OAuth 2.0 / OpenID Connect
      ↓
Google Identity Information
      ↓
Firebase Authentication
      ↓
Secure User Provisioning
      ↓
Protected User Identity Information
      ↓
Firestore Authorization Rules