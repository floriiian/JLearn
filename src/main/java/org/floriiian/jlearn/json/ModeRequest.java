package org.floriiian.jlearn.json;

import java.util.List;

public class ModeRequest {
    private String type;
    private List<String> modes;


    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<String> getModes() {
        return modes;
    }

    public void setModes(List<String> modes) {
        this.modes = modes;
    }
}