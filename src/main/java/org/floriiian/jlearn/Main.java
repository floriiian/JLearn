package org.floriiian.jlearn;

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

import org.floriiian.jlearn.handlers.HiraganaHandler;
import org.floriiian.jlearn.json.*;
import org.floriiian.jlearn.sessions.HiraganaSession;

import java.util.Map;
import java.util.List;
import java.util.*;

public class Main {

    private static final Logger LOGGER = LogManager.getLogger();
    static ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    static HiraganaHandler HIRAGANA_HANDLER;

    public static List<HiraganaSession> hiraganaSessions = new ArrayList<>();

    public static Map<String, Set<String>> singleHiraganaMap = new HashMap<>();
    public static Map<String, Set<String>> dakutenAndHandakutenMap = new HashMap<>();
    public static Map<String, Set<String>> comboHiraganaMap = new HashMap<>();

    static{
        HIRAGANA_HANDLER = new HiraganaHandler();
    }

    /* API handler */

    public static void main(String[] args) {

        Javalin app = Javalin.create().start(9999);

        // {"type": "Hiragana"}
        app.post("/api/create-session", Main::createSession);

        // {"type": "Hiragana","modes": ["singleHiragana", "dakutenAndHandakuten", "comboHiragana"]}
        app.post("/api/load-char", Main::handleNextCharacter);

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

            if (type != null && type.equals("Hiragana")) {

                HiraganaSession session = HIRAGANA_HANDLER.getHiraganaSession(sessionID);

                if (session == null) {
                    ctx.json(OBJECT_MAPPER.writeValueAsString(RequestResponse.error(
                            501,
                            "You are not inside a valid session.")
                    ));
                } else {
                    ctx.json(OBJECT_MAPPER.writeValueAsString(session.endSession()));
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


    private static void handleNextCharacter(Context ctx) throws JsonProcessingException {

        String sessionID = ctx.cookie("sessionID");

        try{
            CharacterRequest requestBody = OBJECT_MAPPER.readValue(ctx.body(), CharacterRequest.class);
            String type = requestBody.getType();

            if(type != null && type.equals("Hiragana")){

                HiraganaSession session = HIRAGANA_HANDLER.getHiraganaSession(sessionID);

                if(session == null){
                    ctx.json(OBJECT_MAPPER.writeValueAsString(RequestResponse.error(
                            501,
                            "You are not inside a valid session.")
                    ));
                }
                else{
                    ctx.json(OBJECT_MAPPER.writeValueAsString(session.loadNextCharacter()));
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

                    HiraganaSession session = HIRAGANA_HANDLER.getHiraganaSession(sessionID);

                    if(session == null){
                        ctx.json(OBJECT_MAPPER.writeValueAsString(RequestResponse.error(
                                501,
                                "You are not inside a valid session.")
                        ));
                    }
                    else{
                        ctx.json(OBJECT_MAPPER.writeValueAsString(session.handleAnswer(answer)));
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

        String sessionID = ctx.cookie("sessionID");

        try {
            ModeRequest requestBody = OBJECT_MAPPER.readValue(ctx.body(), ModeRequest.class);

            String type = requestBody.getType();
            List<String> selectedModes = requestBody.getModes();

            if (selectedModes != null && type != null) {

                if (type.equals("Hiragana")) {
                    if (HIRAGANA_HANDLER.getHiraganaSession(sessionID) != null) {
                        ctx.json(OBJECT_MAPPER.writeValueAsString(RequestResponse.error(
                                501,
                                "Already inside session."
                        )));
                        return;
                    }

                    String sha3Hex = DigestUtils.sha3_256Hex(RandomStringUtils.randomAlphanumeric(20));
                    Cookie sessionCookie = new Cookie("sessionID", sha3Hex);
                    sessionCookie.setHttpOnly(true);
                    sessionCookie.setSecure(true);
                    sessionCookie.setSameSite(SameSite.STRICT);
                    ctx.cookie(sessionCookie);

                    HiraganaSession session = new HiraganaSession(
                            sha3Hex,
                            selectedModes.contains("singleHiragana"),
                            selectedModes.contains("dakutenAndHandakuten"),
                            selectedModes.contains("comboHiragana")
                    );
                    hiraganaSessions.add(session);
                    ctx.json(OBJECT_MAPPER.writeValueAsString(session.loadNextCharacter()));
                } else {
                    ctx.json(OBJECT_MAPPER.writeValueAsString(RequestResponse.error(
                            501,
                            "Request to invalid quiz type."
                    )));
                }
            }
        }
        catch (UnrecognizedPropertyException e){
            ctx.json(OBJECT_MAPPER.writeValueAsString(RequestResponse.error(
                    501,
                    "Invalid Request, check your structure."
            )));
        }
    }
}
