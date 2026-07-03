package com.police.trafficfine.service;

import com.police.trafficfine.dto.LoginRequest;
import com.police.trafficfine.dto.LoginResponse;
import com.police.trafficfine.dto.RegisterRequest;
import com.police.trafficfine.dto.UserResponse;
import com.police.trafficfine.exception.DuplicateKeyBusinessException;
import com.police.trafficfine.exception.UnauthorizedException;
import com.police.trafficfine.model.Role;
import com.police.trafficfine.model.User;
import com.police.trafficfine.repository.UserRepository;
import com.police.trafficfine.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        if (!user.isActive()) {
            throw new UnauthorizedException("Account is deactivated. Contact admin.");
        }

        String token = jwtUtil.generateToken(user.getId());

        return LoginResponse.builder()
                .success(true)
                .token(token)
                .user(UserResponse.from(user))
                .build();
    }

    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateKeyBusinessException("email already exists.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.OFFICER)
                .badgeNumber(request.getBadgeNumber())
                .phone(request.getPhone())
                .district(request.getDistrict())
                .active(true)
                .build();

        User saved = userRepository.save(user);
        return UserResponse.from(saved);
    }
}
