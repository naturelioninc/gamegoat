package com.xmasgoat.games;
import org.junit.Test;
import static org.junit.Assert.*;

public class InvitationReferrerTest {
    @Test public void acceptsInvitationsAndCodesOnly() {
        assertEquals("/join/abcdefghijklmnop", InvitationReferrer.path("invite=abcdefghijklmnop"));
        assertEquals("/join?code=ABC123", InvitationReferrer.path("code=abc123"));
        assertNull(InvitationReferrer.path("invite=https%3A%2F%2Fevil.com"));
        assertNull(InvitationReferrer.path("invite=..%2F..%2Faccount"));
        assertNull(InvitationReferrer.path("code=ABC12"));
        assertNull(InvitationReferrer.path("invite=%ZZ"));
        assertNull(InvitationReferrer.path(null));
    }
}
