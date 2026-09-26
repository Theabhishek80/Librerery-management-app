package com.library.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private Set<String> roles;
    private boolean enabled;
    private LocalDateTime createdAt;
}
