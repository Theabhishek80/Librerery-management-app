package com.library.dto;

import com.library.entity.BorrowStatus;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BorrowResponse {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String borrowerUsername;
    private LocalDate borrowDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private BorrowStatus status;
}
