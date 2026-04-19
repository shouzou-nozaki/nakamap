package com.nakamap.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCircleRequest {

    @NotBlank
    private String name;
}
