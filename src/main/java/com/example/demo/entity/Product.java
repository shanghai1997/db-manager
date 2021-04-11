package com.example.demo.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.sql.Date;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "products")
@Builder
public class Product {
    //设置主键
    @Id
    //设置主键为自增
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;//id

    @Column(name = "product_name")
    private String productName;//品名

    @Column(name = "number")
    private int number;//数量

    @Column(name = "selling_price")
    private int price;

    @Column(name = "cost")
    private int cost;

    @Column(name = "supplier")
    private String supplier;//供货商

    @Column(name = "date_listed")
    private LocalDate listedDate;//日期,因为没有使用空间，先使用字符串表示

    @Column(name = "on_sale")
    private boolean soldOut;
}

