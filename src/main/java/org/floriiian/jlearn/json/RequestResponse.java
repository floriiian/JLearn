package org.floriiian.jlearn.json;

import java.util.Collections;
import java.util.List;

public record RequestResponse(Integer code, String message, List<String> data) {

    private static final List<String> EMPTY_LIST = Collections.emptyList();

    public static RequestResponse success() {
        return new RequestResponse(200, "true", EMPTY_LIST);
    }

    public static RequestResponse error(Integer code, String message) {
        return new RequestResponse(code, message, EMPTY_LIST);
    }
}