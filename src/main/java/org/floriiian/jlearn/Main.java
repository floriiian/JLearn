package org.floriiian.jlearn;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.floriiian.jlearn.handlers.HiraganaHandler;
import org.floriiian.jlearn.sessions.HiraganaSession;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class Main {

    public static final Logger LOGGER = LogManager.getLogger();
    public static Map<String, Set<String>> hiraganaMap = new HashMap<>();

    static {
        hiraganaMap = new HiraganaHandler().hiraganaMap;
        System.out.println("JLearn successfully initiated.");
    }

    public static void main(String[] args) {

        HiraganaSession session = new HiraganaSession("A911BNC22X");
        String[] chr = session.loadNextCharacter();

        for(String var  : session.handleAnswer("a")){
            System.out.println(var);
        }

    }
}
