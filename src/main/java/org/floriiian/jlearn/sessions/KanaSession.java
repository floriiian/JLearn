package org.floriiian.jlearn.sessions;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.floriiian.jlearn.Main;
import org.floriiian.jlearn.json.CharacterResponse;
import org.floriiian.jlearn.json.RequestResponse;

import java.util.*;

public class KanaSession {

    public static final Logger LOGGER = LogManager.getLogger();
    Calendar CALENDAR = Calendar.getInstance();

    private final Map<String, Set<String>> remainingKana;

    private final String sessionID;
    private final int allKana;
    private int startingDate = 0;

    public KanaSession(String mode, String sessionID, boolean singleKana, boolean dakutenAndHandakutenKana, boolean comboKana) {

        remainingKana = new HashMap<>();

        if(singleKana){
            remainingKana.putAll(new HashMap<>(mode.equals("Hiragana") ? Main.singleHiraganaMap : Main.singleKatakanaMap));
        }
        if(dakutenAndHandakutenKana){
            remainingKana.putAll(new HashMap<>(mode.equals("Hiragana") ? Main.hiraganaDakutenMap : Main.katakanaDakutenMap));
        }
        if(comboKana){
            remainingKana.putAll(new HashMap<>(mode.equals("Hiragana") ? Main.comboHiraganaMap : Main.comboKatakanaMap));
        }
        this.allKana = remainingKana.size();

        this.sessionID = sessionID;
    }

    public String getSessionID() {
        return this.sessionID;
    }

    public CharacterResponse loadCharacters() {

        LOGGER.debug("Creating new session & sending characters");

        if (this.startingDate == 0) {
            CALENDAR.setTime(new Date());
            this.startingDate = CALENDAR.get(Calendar.MINUTE);
        }

        List<List<String>> kanaPairs = new ArrayList<>();

        remainingKana.forEach((kana, romajiSet) -> {
            List<String> pair = new ArrayList<>();
            pair.add(kana);
            pair.addAll(romajiSet); // Add all romaji representations
            kanaPairs.add(pair);
        });

        Collections.shuffle(kanaPairs);

        return new CharacterResponse(
                200,
                "true",
                kanaPairs
        );
    }

    public RequestResponse endSession(int totalMistakes){

        LOGGER.debug("Ending session with " + totalMistakes + " mistakes.");

        CALENDAR.setTime(new Date());

        int timeTaken = CALENDAR.get(Calendar.MINUTE) - this.startingDate;
        int timeDifference = Math.abs(timeTaken - 2 * this.allKana);  // 2 Seconds per Hiragana

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
