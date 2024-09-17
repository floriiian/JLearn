package org.floriiian.jlearn.handlers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;

public class HiraganaHandler {

    private static final Logger LOGGER = LogManager.getLogger();
    public final Map<String, Set<String>> hiraganaMap = new HashMap<>();

    public HiraganaHandler() {
        try {
            // Grabbing the json
            ObjectMapper mapper = new ObjectMapper();
            InputStream inputStream = getClass().getClassLoader().getResourceAsStream("hiragana.json");
            if (inputStream == null) {
                throw new RuntimeException("File not found in resources");
            }
            JsonNode root = mapper.readTree(inputStream);

            // Loading the JSON into the map

            parseHiragana(root.path("single_hiragana"));
            parseHiragana(root.path("dakuten_hiragana"));
            parseHiragana(root.path("handakuten_hiragana"));
            parseHiragana(root.path("combo_hiragana"));

        } catch (IOException e) {
            LOGGER.error(e);
        }
    }

    private void parseHiragana(JsonNode hiraganaArray) {

        Iterator<JsonNode> elements = hiraganaArray.elements();

        while (elements.hasNext()) {
            JsonNode element = elements.next();
            String character = element.path("char").asText();
            JsonNode romajiNode = element.path("romaji");
            Set<String> romajiSet = new HashSet<>();

            if (romajiNode.isObject()) {
                // Handles cases where there are multiple translations for the same char exist. (Hepburn & Kunrei)
                romajiNode.fields().forEachRemaining(entry -> romajiSet.add(entry.getValue().asText()));
            } else {
                romajiSet.add(romajiNode.asText());
            }
            hiraganaMap.put(character, romajiSet);
        }
    }
}