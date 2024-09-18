package org.floriiian.jlearn.handlers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.floriiian.jlearn.Main;
import org.floriiian.jlearn.sessions.HiraganaSession;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;

public class HiraganaHandler {

    private static final Logger LOGGER = LogManager.getLogger();

    public HiraganaHandler() {
        try {
            // Grabbing the JSON
            ObjectMapper mapper = new ObjectMapper();
            InputStream inputStream = getClass().getClassLoader().getResourceAsStream("hiragana.json");
            if (inputStream == null) {
                throw new RuntimeException("File not found in resources");
            }
            JsonNode root = mapper.readTree(inputStream);

            parseHiragana(root.path("single_hiragana"), Main.singleHiraganaMap);

            parseHiragana(root.path("dakuten_hiragana"), Main.dakutenAndHandakutenMap);
            parseHiragana(root.path("handakuten_hiragana"), Main.dakutenAndHandakutenMap);

            parseHiragana(root.path("combo_hiragana"), Main.comboHiraganaMap);

        } catch (IOException e) {
            LOGGER.error(e);
        }
    }

    private void parseHiragana(JsonNode hiraganaArray, Map<String, Set<String>> targetMap) {
        Iterator<JsonNode> elements = hiraganaArray.elements();

        while (elements.hasNext()) {
            JsonNode element = elements.next();
            String character = element.path("char").asText();
            JsonNode romajiNode = element.path("romaji");
            Set<String> romajiSet = new HashSet<>();

            if (romajiNode.isObject()) {
                // Handles cases where there are multiple translations for the same char (Hepburn & Kunrei)
                romajiNode.fields().forEachRemaining(entry -> romajiSet.add(entry.getValue().asText()));
            } else {
                romajiSet.add(romajiNode.asText());
            }
            targetMap.put(character, romajiSet);
        }
    }

    public HiraganaSession getHiraganaSession(String sessionID) {
        for(HiraganaSession session : Main.hiraganaSessions){
            if(session.getSessionID().equals(sessionID)){
                return session;
            }
        }
        return null;
    }
}