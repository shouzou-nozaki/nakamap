package com.nakamap.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileRequest {
    private String name;
    private String photoUrl;
    private String hobby;
    private String comment;
}
