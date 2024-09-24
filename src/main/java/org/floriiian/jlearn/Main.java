package org.floriiian.jlearn;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;
import io.javalin.Javalin;

import io.javalin.http.Context;
import io.javalin.http.Cookie;
import io.javalin.http.SameSite;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import org.floriiian.jlearn.handlers.KanaHandler;
import org.floriiian.jlearn.json.*;
import org.floriiian.jlearn.sessions.HiraganaSession;

import java.util.Map;
import java.util.List;
import java.util.*;

public class Main {

    private static final Logger LOGGER = LogManager.getLogger();
    static ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    static KanaHandler KANA_HANDLER;

    public static List<HiraganaSession> hiraganaSessions = new ArrayList<>();

    public static Map<String, Set<String>> singleHiraganaMap = new HashMap<>();
    public static Map<String, Set<String>> dakutenAndHandakutenMap = new HashMap<>();
    public static Map<String, Set<String>> comboHiraganaMap = new HashMap<>();

    public static Map<String, Set<String>> singleKatakanaMap = new HashMap<>();
    public static Map<String, Set<String>> katakanaDakutenAndHandakutenMap = new HashMap<>();
    public static Map<String, Set<String>> comboKatakanaMap = new HashMap<>();

    static{
        KANA_HANDLER = new KanaHandler(); // Loads up all the needed Kana JSON files.
        LOGGER.debug(singleKatakanaMap);
    }

    /* API handler */

    public static void main(String[] args) {

        Javalin app = Javalin.create().start(9999);

        app.after(ctx -> {
            ctx.header("Access-Control-Allow-Origin", "*"); // Allow all origins
            ctx.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            ctx.header("Access-Control-Allow-Headers", "Content-Type");
        });

        // {"type": "Hiragana","modes": ["singleHiragana", "dakutenAndHandakuten", "comboHiragana"]}
        app.post("/api/create-session", Main::createSession);

        // {"type": "Hiragana"}
        app.post("/api/load-chars", Main::loadCharacters);

        // {"type": "Hiragana","answer": "po"}
        app.post("api/handle-answer", Main::handleAnswer);

        // {"type": "Hiragana"}
        app.post("api/end-session", Main::endSession);
    }

    /* API methods */

    private static void endSession(Context ctx) throws JsonProcessingException {

        String sessionID = ctx.cookie("sessionID");

        try {
            endSessionRequest requestBody = OBJECT_MAPPER.readValue(ctx.body(), endSessionRequest.class);
            String type = requestBody.type();

            int total_mistakes = 0;

            try{
                total_mistakes = Integer.parseInt(requestBody.total_mistakes());
            }
            catch(NumberFormatException e){
            ctx.json(OBJECT_MAPPER.writeValueAsString(RequestResponse.error(
                    501,
                    "Invalid Request, wrong datatype."
            )));
        }

            if (type != null && type.equals("Hiragana")) {

                HiraganaSession session = getHiraganaSession(sessionID);

                if (session == null) {
                    ctx.json(OBJECT_MAPPER.writeValueAsString(RequestResponse.error(
                            501,
                            "You are not inside a valid session.")
                    ));
                } else {
                    ctx.json(OBJECT_MAPPER.writeValueAsString(session.endSession(total_mistakes)));
                    ctx.removeCookie("sessionID");
                    hiraganaSessions.remove(session);
                }
            }
        } catch (UnrecognizedPropertyException e) {

            LOGGER.debug(e);

            ctx.json(OBJECT_MAPPER.writeValueAsString(RequestResponse.error(
                    501,
                    "Invalid Request, check your structure."
            )));
        }
    }


    private static void loadCharacters(Context ctx) throws JsonProcessingException {

        String sessionID = ctx.cookie("sessionID");

        try{
            CharacterRequest requestBody = OBJECT_MAPPER.readValue(ctx.body(), CharacterRequest.class);
            String type = requestBody.getType();

            if(type != null && type.equals("Hiragana")){

                HiraganaSession session = getHiraganaSession(sessionID);

                if(session == null){
                    ctx.json(OBJECT_MAPPER.writeValueAsString(RequestResponse.error(
                            501,
                            "You are not inside a valid session.")
                    ));
                }
                else{
                    ctx.json(OBJECT_MAPPER.writeValueAsString(session.loadCharacters()));
                }
            }
        }
        catch(UnrecognizedPropertyException e){

            LOGGER.debug(e);

            ctx.json(OBJECT_MAPPER.writeValueAsString(RequestResponse.error(
                    501,
                    "Invalid Request, check your structure."
            )));
        }
    }

    private static void handleAnswer(Context ctx) throws JsonProcessingException {

        String sessionID = ctx.cookie("sessionID");

        try{
            AnswerRequest requestBody = OBJECT_MAPPER.readValue(ctx.body(), AnswerRequest.class);

            String type = requestBody.type();
            String answer = requestBody.answer();

            if(type != null && answer != null){

                if(type.equals("Hiragana")){

                    HiraganaSession session = getHiraganaSession(sessionID);

                    if(session == null){
                        ctx.json(OBJECT_MAPPER.writeValueAsString(RequestResponse.error(
                                501,
                                "You are not inside a valid session.")
                        ));
                    }
                    else{
                       // ctx.json(OBJECT_MAPPER.writeValueAsString(session.handleAnswer(answer)));
                    }
                }
            }
            else{
                ctx.json(OBJECT_MAPPER.writeValueAsString(RequestResponse.error(
                        501,
                        "Invalid Request, missing data."
                )));
            }
        }
        catch(UnrecognizedPropertyException e){
            ctx.json(OBJECT_MAPPER.writeValueAsString(RequestResponse.error(
                    501,
                    "Invalid Request, check your structure."
            )));
        }
    }

    public static void createSession(Context ctx) throws JsonProcessingException {

        String invalidRequest = "Invalid Request, check your structure.";

        String sessionID = ctx.cookie("sessionID");

        try {
            ModeRequest requestBody = null;
            try{
                requestBody = OBJECT_MAPPER.readValue(ctx.body(), ModeRequest.class);
            }
            catch (JacksonException e){
                ctx.json(OBJECT_MAPPER.writeValueAsString(RequestResponse.error(501, invalidRequest)));
                return;
            }

            assert requestBody != null;
            String type = requestBody.getType();
            List<String> selectedModes = requestBody.getModes();

            if(validateMode(selectedModes, type)){

                if (type.equals("Hiragana") && getHiraganaSession(sessionID) == null) {

                    String secureHash = setSessionID(ctx, sessionID);

                    HiraganaSession session = new HiraganaSession(
                            secureHash,
                            Boolean.parseBoolean(selectedModes.get(0)),
                            Boolean.parseBoolean(selectedModes.get(1)),
                            Boolean.parseBoolean(selectedModes.get(2))
                    );
                    hiraganaSessions.add(session);
                    ctx.json(OBJECT_MAPPER.writeValueAsString(session.loadCharacters()));
                }
                else {
                    ctx.json(OBJECT_MAPPER.writeValueAsString(RequestResponse.error(
                            501,
                            "Request contains an invalid quiz type or a session already exists."
                    )));
                }
            }
            else{
                ctx.json(OBJECT_MAPPER.writeValueAsString(RequestResponse.error(501, invalidRequest)));
            }
        }
        catch (UnrecognizedPropertyException e){
            ctx.json(OBJECT_MAPPER.writeValueAsString(RequestResponse.error(501, invalidRequest)));
        }
    }

    public static String setSessionID(Context ctx, String sessionID) {
        String sha3Hex = DigestUtils.sha3_256Hex(RandomStringUtils.randomAlphanumeric(20));
        Cookie sessionCookie = new Cookie("sessionID", sha3Hex);
        sessionCookie.setHttpOnly(true);
        sessionCookie.setSecure(true);
        sessionCookie.setSameSite(SameSite.STRICT);

        ctx.cookie(sessionCookie);

        return sha3Hex;
    }

    public static boolean validateMode(List<String> selectedModes, String type) {

        if (selectedModes != null && type != null) {
            for (String selection : selectedModes) {
                if (!selection.equals("true") && !selection.equals("false")) {
                    return false;
                }
            }
        }
        return true;
    }

    public static HiraganaSession getHiraganaSession(String sessionID) {
        for(HiraganaSession session : Main.hiraganaSessions){
            if(session.getSessionID().equals(sessionID)){
                return session;
            }
        }
        return null;
    }
}
