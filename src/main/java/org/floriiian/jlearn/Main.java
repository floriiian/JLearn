package org.floriiian.jlearn;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.Javalin;

import io.javalin.http.Cookie;
import io.javalin.http.SameSite;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.floriiian.jlearn.handlers.HiraganaHandler;
import org.floriiian.jlearn.json.ModeRequest;
import org.floriiian.jlearn.sessions.HiraganaSession;

import java.util.Map;
import java.util.List;
import java.util.*;

public class Main {

    private static final Logger LOGGER = LogManager.getLogger();
    static ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    static final HiraganaHandler HIRAGANA_HANDLER =  new HiraganaHandler();

    public static List<HiraganaSession> hiraganaSessions = new ArrayList<>();

    public static Map<String, Set<String>> singleHiraganaMap = new HashMap<>();
    public static Map<String, Set<String>> dakutenAndHandakutenMap = new HashMap<>();
    public static Map<String, Set<String>> comboHiraganaMap = new HashMap<>();

    static {
        // Constructor
        LOGGER.debug("JLearn successfully initiated.");
    }

    public static void main(String[] args) {

        try {
            Javalin app = Javalin.create().start(9999);
            System.out.println("Javalin server started on port 9999");

            app.post("/api/create-session/modes", ctx -> {

                ModeRequest requestBody = OBJECT_MAPPER.readValue(ctx.body(), ModeRequest.class);

                String type = requestBody.getType();
                List<String> selectedModes = requestBody.getModes();

                if (selectedModes != null && type != null) {

                    String sessionID = ctx.cookieStore().get("sessionID");

                    if (!sessionID.isEmpty()) {
                        if (HIRAGANA_HANDLER.getHiraganaSession(sessionID) != null) {
                            ctx.result("Already inside a session.");
                            return;
                        }
                    } else {
                        String sha3Hex = DigestUtils.sha3_256Hex(RandomStringUtils.randomAlphanumeric(20));
                        Cookie sessionCookie = new Cookie("sessionID", sha3Hex);
                        sessionCookie.setHttpOnly(true);
                        sessionCookie.setSecure(true);
                        sessionCookie.setSameSite(SameSite.STRICT);

                        ctx.cookie(sessionCookie);

                        if (type.equals("Hiragana")) {

                            HiraganaSession session = new HiraganaSession(
                                    "A911BNC22X",
                                    selectedModes.contains("singleHiragana"),
                                    selectedModes.contains("dakutenAndHandakuten"),
                                    selectedModes.contains("comboHiragana")
                            );
                            hiraganaSessions.add(session);

                            ctx.json(session.loadNextCharacter());
                            return;
                        }
                    }
                    ctx.result("Modes processed successfully");
                }
            });
        } catch (Exception e) {
            LOGGER.debug(e);
        }
    }
}
