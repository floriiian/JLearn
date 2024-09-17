package org.floriiian.jlearn.sessions;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.floriiian.jlearn.Main;

import java.util.*;

public class HiraganaSession {

    public static final Logger LOGGER = LogManager.getLogger();
    private final Map<String, Set<String>> remainingHiragana;
    private final String sessionID;
    private String currentHiragana;
    private Integer currentStreak;
    private Integer totalMistakes;

    public HiraganaSession(String sessionID) {
        remainingHiragana = new HashMap<>(Main.hiraganaMap);
        this.sessionID = sessionID;
        this.currentStreak = 0;
        this.totalMistakes = 0;
    }

    public String getSessionID() {
        return this.sessionID;
    }

    public void removeCharacter(String hiraganaChar) {
        remainingHiragana.remove(hiraganaChar);
        LOGGER.debug(this.remainingHiragana);
    }

    public String[] loadNextCharacter() {

        int allHiragana = Main.hiraganaMap.size();
        int leftHiragana = allHiragana - this.remainingHiragana.size();

        int remainingHiraganaAmount = this.remainingHiragana.size();

        if (remainingHiraganaAmount > 0) {
            Object randomChar = remainingHiragana.keySet().stream()
                    .skip(new Random().nextInt(remainingHiragana.size()))
                    .findFirst()
                    .orElse(null);

            assert randomChar != null;

            String nextChar = randomChar.toString();
            this.currentHiragana = nextChar;

            return new String[]{String.valueOf(allHiragana), String.valueOf(leftHiragana), nextChar};
        } else {
            return new String[]{null};
        }
    }


    public String[] handleAnswer(String userInput) {

        Set<String> possibleRomaji = this.remainingHiragana.get(this.currentHiragana);



        if(possibleRomaji != null && possibleRomaji.contains(userInput)){
            removeCharacter(this.currentHiragana);
            this.currentStreak += 1;
            return new String[]{"true"};
        }
        else {
            this.currentStreak = 0;
            this.totalMistakes += 1;

            assert possibleRomaji != null;
            if (possibleRomaji.size() == 2) {

                Iterator<String> iterator = possibleRomaji.iterator();
                String firstRomaji = iterator.next();
                String secondRomaji = iterator.next();

                return new String[]{"false", String.join(", ", firstRomaji), String.join(", ", secondRomaji)};

            }
            return new String[]{"false", String.join(", ", possibleRomaji)};
        }
    }
}
