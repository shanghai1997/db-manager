package com.example.demo.entity;

import lombok.*;

import java.util.List;
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class ProductContext {
    List<Product> products;
}
