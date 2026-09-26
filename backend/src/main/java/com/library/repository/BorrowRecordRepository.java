package com.library.repository;

import com.library.entity.BorrowRecord;
import com.library.entity.BorrowStatus;
import com.library.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    List<BorrowRecord> findByUserOrderByCreatedAtDesc(User user);

    List<BorrowRecord> findAllByOrderByCreatedAtDesc();

    Optional<BorrowRecord> findByBook_IdAndUser_IdAndStatus(Long bookId, Long userId, BorrowStatus status);

    long countByBook_IdAndStatus(Long bookId, BorrowStatus status);
}
