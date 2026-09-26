package com.library.controller;

import com.library.dto.BorrowResponse;
import com.library.security.UserPrincipal;
import com.library.service.BorrowService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrow")
@RequiredArgsConstructor
public class BorrowController {

    private final BorrowService borrowService;

    @PostMapping("/{bookId}")
    public BorrowResponse borrowBook(@PathVariable Long bookId, Authentication auth) {
        String username = ((UserPrincipal) auth.getPrincipal()).getUsername();
        return borrowService.borrowBook(bookId, username);
    }

    @PutMapping("/return/{recordId}")
    public BorrowResponse returnBook(@PathVariable Long recordId, Authentication auth) {
        String username = ((UserPrincipal) auth.getPrincipal()).getUsername();
        boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        return borrowService.returnBook(recordId, username, isAdmin);
    }

    @GetMapping("/my")
    public List<BorrowResponse> myBorrowedBooks(Authentication auth) {
        String username = ((UserPrincipal) auth.getPrincipal()).getUsername();
        return borrowService.myBorrowedBooks(username);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<BorrowResponse> allBorrowRecords() {
        return borrowService.allBorrowRecords();
    }
}
