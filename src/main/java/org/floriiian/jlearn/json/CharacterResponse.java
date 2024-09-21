package org.floriiian.jlearn.json;

import java.util.List;

public record CharacterResponse(Integer code, String message, List <List<String>> data) {
}