package org.floriiian.jlearn.sessions;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.floriiian.jlearn.Main;
import org.floriiian.jlearn.json.RequestResponse;

import java.util.*;

public class HiraganaSession {

    public static final Logger LOGGER = LogManager.getLogger();
    Calendar CALENDAR = Calendar.getInstance();

    private final Map<String, Set<String>> remainingHiragana;

    private final String sessionID;
    private String currentHiragana;
    private int currentStreak;
    private int totalMistakes;
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
        this.currentStreak = 0;
        this.totalMistakes = 0;
    }

    public String getSessionID() {
        return this.sessionID;
    }

    public void removeCharacter(String hiraganaChar) {
        remainingHiragana.remove(hiraganaChar);
    }

    public RequestResponse loadNextCharacter() {

        if(this.startingDate == 0){
            CALENDAR.setTime(new Date());
            this.startingDate = CALENDAR.get(Calendar.MINUTE);
        }

        int leftHiragana = this.allHiragana - this.remainingHiragana.size();

        int remainingHiraganaAmount = this.remainingHiragana.size();

        if (remainingHiraganaAmount > 0) {
            Object randomChar = remainingHiragana.keySet().stream()
                    .skip(new Random().nextInt(remainingHiragana.size()))
                    .findFirst()
                    .orElse(null);

            assert randomChar != null;

            String nextChar = randomChar.toString();
            this.currentHiragana = nextChar;

            LOGGER.debug("Character loaded: " + nextChar);;

            return new RequestResponse(
                    200,
                    "true",
                    List.of(String.valueOf(this.allHiragana), String.valueOf(leftHiragana), nextChar)
            );
        } else {
            return new RequestResponse(
                    200,
                    null,
                    List.of()
            );
        }
    }


    public RequestResponse handleAnswer(String userInput) {

        LOGGER.debug("Answer handled");;

        Set<String> possibleRomaji = this.remainingHiragana.get(this.currentHiragana);

        if(possibleRomaji != null && possibleRomaji.contains(userInput)) {
            removeCharacter(this.currentHiragana);
            this.currentStreak += 1;
            return RequestResponse.success();
        }
        else {
            this.currentStreak = 0;
            this.totalMistakes += 1;

            if(possibleRomaji == null) {
                return RequestResponse.error(
                        501,
                        "Unable to retrieve character. Has character been loaded? "
                );
            }
            else{
                if(possibleRomaji.size() == 2) {

                    Iterator<String> iterator = possibleRomaji.iterator();
                    String firstRomaji = iterator.next();
                    String secondRomaji = iterator.next();

                    return new RequestResponse(
                            200,
                            "false",
                            List.of( String.join(", ", firstRomaji), String.join(", ", secondRomaji))
                    );
                }
                else{
                    return new RequestResponse(
                            200,
                            "false",
                            List.of(String.join(", ", possibleRomaji))
                    );
                }
            }
        }
    }

    public RequestResponse endSession(){

        LOGGER.debug("Session end");;

        CALENDAR.setTime(new Date());

        int timeTaken = CALENDAR.get(Calendar.MINUTE) - this.startingDate;
        int timeDifference = Math.abs(timeTaken - 2 * this.allHiragana);  // 2 Seconds per Hiragana

        double timePenalty = Math.min(timeDifference, 10) * 0.5;
        int mistakePenalty = totalMistakes * 2;

        double score = 100 - timePenalty -mistakePenalty;

        LOGGER.debug("Streak: %d Mistakes: %d".formatted(
                        this.currentStreak,
                        this.totalMistakes
        ));

        return new RequestResponse(
                200,
                "true",
                List.of(String.valueOf(score))
        );
    }
}
