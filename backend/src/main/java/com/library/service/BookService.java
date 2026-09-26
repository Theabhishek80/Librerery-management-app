package com.library.service;

import com.library.dto.BookRequest;
import com.library.dto.BookResponse;
import com.library.entity.Book;
import com.library.exception.ApiException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/**
 * Books added by ANY authenticated user are visible globally to every
 * user of the system — there is a single shared catalog (like one
 * shared folder of books), not a per-user private list.
 */
@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    public BookResponse addBook(BookRequest request, String username) {
        if (request.getIsbn() != null && !request.getIsbn().isBlank()
                && bookRepository.existsByIsbn(request.getIsbn())) {
            throw new ApiException("A book with this ISBN already exists", HttpStatus.BAD_REQUEST);
        }

        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .isbn(request.getIsbn())
                .category(request.getCategory())
                .description(request.getDescription())
                .totalCopies(request.getTotalCopies())
                .availableCopies(request.getTotalCopies())
                .coverImageUrl(request.getCoverImageUrl())
                .addedByUsername(username)
                .build();

        return toResponse(bookRepository.save(book));
    }

    public Page<BookResponse> getAllBooks(String search, Pageable pageable) {
        Page<Book> books;
        if (search != null && !search.isBlank()) {
            books = bookRepository
                    .findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCaseOrCategoryContainingIgnoreCase(
                            search, search, search, pageable);
        } else {
            books = bookRepository.findAll(pageable);
        }
        return books.map(this::toResponse);
    }

    public BookResponse getBookById(Long id) {
        return toResponse(findBookOrThrow(id));
    }

    public BookResponse updateBook(Long id, BookRequest request, String username, boolean isAdmin) {
        Book book = findBookOrThrow(id);

        if (!isAdmin && !book.getAddedByUsername().equals(username)) {
            throw new ApiException("You can only edit books you added", HttpStatus.FORBIDDEN);
        }

        int borrowedCopies = book.getTotalCopies() - book.getAvailableCopies();

        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setIsbn(request.getIsbn());
        book.setCategory(request.getCategory());
        book.setDescription(request.getDescription());
        book.setTotalCopies(request.getTotalCopies());
        book.setAvailableCopies(Math.max(0, request.getTotalCopies() - borrowedCopies));
        book.setCoverImageUrl(request.getCoverImageUrl());

        return toResponse(bookRepository.save(book));
    }

    public void deleteBook(Long id, String username, boolean isAdmin) {
        Book book = findBookOrThrow(id);
        if (!isAdmin && !book.getAddedByUsername().equals(username)) {
            throw new ApiException("You can only delete books you added", HttpStatus.FORBIDDEN);
        }
        bookRepository.delete(book);
    }

    private Book findBookOrThrow(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
    }

    private BookResponse toResponse(Book book) {
        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .isbn(book.getIsbn())
                .category(book.getCategory())
                .description(book.getDescription())
                .totalCopies(book.getTotalCopies())
                .availableCopies(book.getAvailableCopies())
                .coverImageUrl(book.getCoverImageUrl())
                .addedByUsername(book.getAddedByUsername())
                .createdAt(book.getCreatedAt())
                .build();
    }
}
