package com.library.service;

import com.library.dto.BorrowResponse;
import com.library.entity.*;
import com.library.exception.ApiException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRecordRepository;
import com.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BorrowService {

    private static final int LOAN_PERIOD_DAYS = 14;

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    @Transactional
    public BorrowResponse borrowBook(Long bookId, String username) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (book.getAvailableCopies() <= 0) {
            throw new ApiException("No copies available for this book right now", HttpStatus.BAD_REQUEST);
        }

        borrowRecordRepository.findByBook_IdAndUser_IdAndStatus(bookId, user.getId(), BorrowStatus.BORROWED)
                .ifPresent(r -> { throw new ApiException("You already have this book borrowed", HttpStatus.BAD_REQUEST); });

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        BorrowRecord record = BorrowRecord.builder()
                .book(book)
                .user(user)
                .borrowDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(LOAN_PERIOD_DAYS))
                .status(BorrowStatus.BORROWED)
                .build();

        return toResponse(borrowRecordRepository.save(record));
    }

    @Transactional
    public BorrowResponse returnBook(Long recordId, String username, boolean isAdmin) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found"));

        if (!isAdmin && !record.getUser().getUsername().equals(username)) {
            throw new ApiException("You cannot return a book borrowed by someone else", HttpStatus.FORBIDDEN);
        }
        if (record.getStatus() == BorrowStatus.RETURNED) {
            throw new ApiException("This book has already been returned", HttpStatus.BAD_REQUEST);
        }

        record.setStatus(BorrowStatus.RETURNED);
        record.setReturnDate(LocalDate.now());

        Book book = record.getBook();
        book.setAvailableCopies(Math.min(book.getTotalCopies(), book.getAvailableCopies() + 1));
        bookRepository.save(book);

        return toResponse(borrowRecordRepository.save(record));
    }

    public List<BorrowResponse> myBorrowedBooks(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return borrowRecordRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toResponse).toList();
    }

    public List<BorrowResponse> allBorrowRecords() {
        return borrowRecordRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse).toList();
    }

    private BorrowResponse toResponse(BorrowRecord r) {
        return BorrowResponse.builder()
                .id(r.getId())
                .bookId(r.getBook().getId())
                .bookTitle(r.getBook().getTitle())
                .borrowerUsername(r.getUser().getUsername())
                .borrowDate(r.getBorrowDate())
                .dueDate(r.getDueDate())
                .returnDate(r.getReturnDate())
                .status(r.getStatus())
                .build();
    }
}
