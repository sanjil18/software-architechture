package com.police.trafficfine.exception;

public class DuplicateKeyBusinessException extends RuntimeException {
    public DuplicateKeyBusinessException(String message) {
        super(message);
    }
}
