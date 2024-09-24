package org.floriiian.jlearn.handlers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.floriiian.jlearn.Main;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

public class KanaHandler {

    private static final Logger LOGGER = LogManager.getLogger();
    ObjectMapper MAPPER = new ObjectMapper();

    public KanaHandler() {
        try {

            JsonNode hiraganaJson = setInputStream("hiragana");

            parseKana(hiraganaJson.path("single_hiragana"), Main.singleHiraganaMap);
            parseKana(hiraganaJson.path("dakuten_hiragana"), Main.dakutenAndHandakutenMap);
            parseKana(hiraganaJson.path("handakuten_hiragana"), Main.dakutenAndHandakutenMap);
            parseKana(hiraganaJson.path("combo_hiragana"), Main.comboHiraganaMap);

            JsonNode KatakanaJson = setInputStream("katakana");

            parseKana(KatakanaJson.path("single_katakana"), Main.singleKatakanaMap);
            parseKana(KatakanaJson.path("dakuten_katakana"), Main.katakanaDakutenAndHandakutenMap);
            parseKana(KatakanaJson.path("handakuten_katakana"), Main.katakanaDakutenAndHandakutenMap);
            parseKana(KatakanaJson.path("combo_katakana"), Main.comboKatakanaMap);


        } catch (IOException e) {
            LOGGER.error(e);
        }
    }

    private JsonNode setInputStream(String stream) throws IOException {
        try (InputStream loadKataData = getClass().getClassLoader().getResourceAsStream(stream + ".json")) {
            if (loadKataData == null) {
                throw new RuntimeException(stream + " not found in resources");
            }
            return MAPPER.readTree(loadKataData);
        }
    }

    private void parseKana(JsonNode kanaArray, Map<String, Set<String>> targetMap) {
        Iterator<JsonNode> elements = kanaArray.elements();

        while (elements.hasNext()) {
            JsonNode element = elements.next();
            String character = element.path("char").asText();
            JsonNode romajiNode = element.path("romaji");
            Set<String> romajiSet = new HashSet<>();

            if (romajiNode.isObject()) {
                romajiNode.fields().forEachRemaining(entry -> romajiSet.add(entry.getValue().asText()));
            } else {
                romajiSet.add(romajiNode.asText());
            }
            targetMap.put(character, romajiSet);
        }
    }
}