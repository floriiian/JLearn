package org.floriiian.jlearn.sessions;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.floriiian.jlearn.Main;
import org.floriiian.jlearn.json.CharacterResponse;
import org.floriiian.jlearn.json.RequestResponse;

import java.util.*;

public class HiraganaSession {

    public static final Logger LOGGER = LogManager.getLogger();
    Calendar CALENDAR = Calendar.getInstance();

    private final Map<String, Set<String>> remainingHiragana;

    private final String sessionID;
    private final int allHiragana;
    private int startingDate = 0;

    public HiraganaSession(String sessionID, boolean singleHiragana, boolean dakutenAndHandakuten, boolean comboHiragana) {

        remainingHiragana = new HashMap<>();

        if(singleHiragana){
            remainingHiragana.putAll(new HashMap<>(Main.singleHiraganaMap));
        }
        if(dakutenAndHandakuten){
            remainingHiragana.putAll(new HashMap<>(Main.dakutenAndHandakutenMap));
        }
        if(comboHiragana){
            remainingHiragana.putAll(new HashMap<>(Main.comboHiraganaMap));
        }
        this.allHiragana = remainingHiragana.size();

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

        remainingHiragana.forEach((hiragana, romajiSet) -> {
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
        int timeDifference = Math.abs(timeTaken - 2 * this.allHiragana);  // 2 Seconds per Hiragana

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
