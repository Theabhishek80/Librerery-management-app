package com.library.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookResponse {
    private Long id;
    private String title;
    private String author;
    private String isbn;
    private String category;
    private String description;
    private Integer totalCopies;
    private Integer availableCopies;
    private String coverImageUrl;
    private String addedByUsername;
    private LocalDateTime createdAt;
}
