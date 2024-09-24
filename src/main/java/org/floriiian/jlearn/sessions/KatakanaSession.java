package org.floriiian.jlearn.sessions;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.floriiian.jlearn.Main;
import org.floriiian.jlearn.json.CharacterResponse;
import org.floriiian.jlearn.json.RequestResponse;

import java.util.*;

public class KatakanaSession {

    public static final Logger LOGGER = LogManager.getLogger();
    Calendar CALENDAR = Calendar.getInstance();

    private final Map<String, Set<String>> remainingKatakana;

    private final String sessionID;
    private final int allKatakana;
    private int startingDate = 0;

    public KatakanaSession(String sessionID, boolean singleKatakana, boolean dakutenAndHandakuten, boolean comboKatakana) {

        remainingKatakana = new HashMap<>();

        if(singleKatakana){
            remainingKatakana.putAll(new HashMap<>(Main.singleKatakanaMap));
        }
        if(dakutenAndHandakuten){
            remainingKatakana.putAll(new HashMap<>(Main.katakanaDakutenAndHandakutenMap));
        }
        if(comboKatakana){
            remainingKatakana.putAll(new HashMap<>(Main.comboKatakanaMap));
        }
        this.allKatakana = remainingKatakana.size();

        this.sessionID = sessionID;
    }

    public String getSessionID() {
        return this.sessionID;
    }

    public CharacterResponse loadCharacters() {

        if (this.startingDate == 0) {
            CALENDAR.setTime(new Date());
            this.startingDate = CALENDAR.get(Calendar.MINUTE);
        }

        List<List<String>> hiraganaPairs = new ArrayList<>();

        remainingKatakana.forEach((hiragana, romajiSet) -> {
            List<String> pair = new ArrayList<>();
            pair.add(hiragana);
            pair.addAll(romajiSet); // Add all romaji representations
            hiraganaPairs.add(pair);
        });

        Collections.shuffle(hiraganaPairs);

        LOGGER.debug(hiraganaPairs);

        return new CharacterResponse(
                200,
                "true",
                hiraganaPairs
        );
    }

    public RequestResponse endSession(int totalMistakes){

        LOGGER.debug("Session end requested");;

        CALENDAR.setTime(new Date());

        int timeTaken = CALENDAR.get(Calendar.MINUTE) - this.startingDate;
        int timeDifference = Math.abs(timeTaken - 2 * this.allKatakana);  // 2 Seconds per Hiragana

        double timePenalty = Math.min(timeDifference, 10) * 0.5;
        int mistakePenalty = totalMistakes * 2;

        double score = 100 - timePenalty -mistakePenalty;

        return new RequestResponse(
                200,
                "true",
                List.of(String.valueOf(score))
        );
    }
}
