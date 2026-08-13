package com.pmp.sgdj.exception;

public class AccountLockedException extends RuntimeException {

    /** Duree d'attente restante en secondes, ou null si le compte est verrouille indefiniment (email requis). */
    private final Long retryAfterSeconds;

    public AccountLockedException(String message) {
        this(message, null);
    }

    public AccountLockedException(String message, Long retryAfterSeconds) {
        super(message);
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public Long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
