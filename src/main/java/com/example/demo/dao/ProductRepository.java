package com.example.demo.dao;


import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

import javax.persistence.SqlResultSetMapping;
import javax.transaction.Transactional;

import com.example.demo.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * @author Thomas Darimont
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // use JPQL instead of native queries https://www.baeldung.com/spring-data-jpa-query
    @Query(value = "SELECT p FROM Product p")
    List<Product> findAllProduct();

    @Query(value = "SELECT p From Product p WHERE p.productName = :name")
    Product findProductById(@Param("name") String name);

    @Query(value = "SELECT p FROM Product p")
    Page<Product> findProductPage(Pageable pageable);

    @Query(value = "SELECT p From Product p WHERE p.id = :id")
    Product findProductByName(@Param("id") int id);

    @Query(value = "SELECT p From Product p WHERE p.soldOut = :s")
    List<Product> findProductByStatus(@Param("s") boolean status);

    @Query(value = "SELECT p From Product p WHERE p.listedDate >= :d1 AND p.listedDate <= :d2")
    List<Product> findProductWithinTimeRange(@Param("d1") Date startingDate, @Param("d2") Date endingDate);

    @Modifying
    @Query("DELETE FROM Product p WHERE p.soldOut = true")
    int deleteDeactivatedProducts();

    @Transactional
    @Modifying
    @Query(
            value = "insert into products (product_name, number, selling_price, cost, supplier, date_listed, on_sale) " +
                            "values (:name, :num, :price, :cost, :supplier, :lDate, :sOut)",
            nativeQuery = true)
    void insertUser(@Param("name") String name, @Param("num") int num, @Param("price") int sellingPrice,
                    @Param("cost") int cost, @Param("supplier") String supplier,
                    @Param("lDate") LocalDate listedDate, @Param("sOut") boolean soldOut);


}

