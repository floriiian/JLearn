package org.floriiian.jlearn;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.Javalin;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.floriiian.jlearn.handlers.HiraganaHandler;
import org.floriiian.jlearn.json.ModeRequest;
import org.floriiian.jlearn.sessions.HiraganaSession;

import java.util.Map;
import java.util.List;
import java.util.*;

public class Main {

    public static final Logger LOGGER = LogManager.getLogger();
    static ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public static List<HiraganaSession> hiraganaSessions = new ArrayList<>();

    public static Map<String, Set<String>> singleHiraganaMap = new HashMap<>();
    public static Map<String, Set<String>> dakutenAndHandakutenMap = new HashMap<>();
    public static Map<String, Set<String>> comboHiraganaMap = new HashMap<>();

    static {
        // Constructor
        HiraganaHandler hiraganaHandler =  new HiraganaHandler();
        System.out.println("JLearn successfully initiated.");
    }

    public static void main(String[] args) {

        Javalin app = Javalin.create().start(9999);

        app.post("/api/create-session/modes", ctx -> {

            ModeRequest requestBody = OBJECT_MAPPER.readValue(ctx.body(), ModeRequest.class);

            String type = requestBody.getType();
            List<String> selectedModes = requestBody.getModes();

            if(selectedModes != null){

                if (type.equals("Hiragana")) {
                    hiraganaSessions.add(new HiraganaSession(
                            "A911BNC22X",
                            selectedModes.contains("singleHiragana"),
                            selectedModes.contains("dakutenAndHandakuten"),
                            selectedModes.contains("comboHiragana")
                    ));
                }
                ctx.result("Modes processed successfully");
            }
        });
    }
}
