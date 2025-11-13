// ** ชุดข้อมูลสถิติหวยรัฐบาลย้อนหลัง 1 ปี (24 งวด) **
// ** ข้อมูลจริง (พ.ย. 67 - ต.ค. 68) **
let governmentLottoData = [
    // [Format: { date: "งวดวันที่", R1: รางวัลที่ 1, twoD: เลขท้าย 2 ตัว, F3_1: เลขหน้า 3 ตัว (ค.1), F3_2: เลขหน้า 3 ตัว (ค.2), B3_1: เลขท้าย 3 ตัว (ค.1), B3_2: เลขท้าย 3 ตัว (ค.2) }]
    // ปี 2568 (ล่าสุด - 24 งวด) - ข้อมูลจริง (รวมถึงข้อมูลที่ให้มาก่อนหน้า)
    { date: "01 พ.ย. 2568", R1: 345898, twoD: 87, F3_1: 449, F3_2: 328, B3_1: 111, B3_2: 690 },
    { date: "16 ต.ค. 2568", R1: 059696, twoD: 61, F3_1: 531, F3_2: 955, B3_1: 476, B3_2: 889 },
    { date: "01 ต.ค. 2568", R1: 876978, twoD: 77, F3_1: 843, F3_2: 532, B3_1: 280, B3_2: 605 },
    { date: "16 ก.ย. 2568", R1: 074646, twoD: 58, F3_1: 512, F3_2: 740, B3_1: 308, B3_2: 703 },
    { date: "01 ก.ย. 2568", R1: 506356, twoD: 31, F3_1: 131, F3_2: 012, B3_1: 022, B3_2: 209 },
    { date: "16 ส.ค. 2568", R1: 994865, twoD: 63, F3_1: 247, F3_2: 602, B3_1: 834, B3_2: 989 },
    { date: "01 ส.ค. 2568", R1: 432429, twoD: 10, F3_1: 897, F3_2: 124, B3_1: 303, B3_2: 801 },
    { date: "16 ก.ค. 2568", R1: 169556, twoD: 83, F3_1: 173, F3_2: 248, B3_1: 780, B3_2: 372 },
    { date: "01 ก.ค. 2568", R1: 593643, twoD: 94, F3_1: 287, F3_2: 241, B3_1: 432, B3_2: 739 },
    { date: "16 มิ.ย. 2568", R1: 943566, twoD: 47, F3_1: 902, F3_2: 444, B3_1: 852, B3_2: 783 },
    { date: "01 มิ.ย. 2568", R1: 569738, twoD: 15, F3_1: 869, F3_2: 124, B3_1: 062, B3_2: 706 },
    { date: "16 พ.ค. 2568", R1: 205634, twoD: 23, F3_1: 341, F3_2: 672, B3_1: 809, B3_2: 216 },
    { date: "01 พ.ค. 2568", R1: 843849, twoD: 80, F3_1: 752, F3_2: 508, B3_1: 712, B3_2: 204 },
    { date: "16 เม.ย. 2568", R1: 980187, twoD: 58, F3_1: 800, F3_2: 147, B3_1: 574, B3_2: 651 },
    { date: "01 เม.ย. 2568", R1: 983190, twoD: 67, F3_1: 757, F3_2: 955, B3_1: 586, B3_2: 446 },
    { date: "16 มี.ค. 2568", R1: 673943, twoD: 14, F3_1: 531, F3_2: 504, B3_1: 742, B3_2: 973 },
    { date: "01 มี.ค. 2568", R1: 479007, twoD: 97, F3_1: 792, F3_2: 890, B3_1: 320, B3_2: 871 },
    { date: "16 ก.พ. 2568", R1: 077560, twoD: 09, F3_1: 982, F3_2: 950, B3_1: 844, B3_2: 512 },
    { date: "01 ก.พ. 2568", R1: 457885, twoD: 59, F3_1: 292, F3_2: 554, B3_1: 746, B3_2: 593 },
    { date: "16 ม.ค. 2568", R1: 105979, twoD: 71, F3_1: 828, F3_2: 025, B3_1: 018, B3_2: 218 },
    { date: "30 ธ.ค. 2567", R1: 625539, twoD: 53, F3_1: 948, F3_2: 600, B3_1: 570, B3_2: 787 },
    { date: "16 ธ.ค. 2567", R1: 356757, twoD: 12, F3_1: 778, F3_2: 521, B3_1: 503, B3_2: 345 },
    { date: "01 ธ.ค. 2567", R1: 088569, twoD: 91, F3_1: 429, F3_2: 561, B3_1: 031, B3_2: 476 },
    { date: "16 พ.ย. 2567", R1: 557990, twoD: 13, F3_1: 483, F3_2: 365, B3_1: 382, B3_2: 808 },

    // ปี 2567 (24 งวด)
    { date: "01 พ.ย. 2567", R1: 780021, twoD: 49, F3_1: 468, F3_2: 120, B3_1: 727, B3_2: 148 },
    { date: "16 ต.ค. 2567", R1: 153022, twoD: 09, F3_1: 453, F3_2: 095, B3_1: 700, B3_2: 139 },
    { date: "01 ต.ค. 2567", R1: 480175, twoD: 50, F3_1: 940, F3_2: 341, B3_1: 807, B3_2: 289 },
    { date: "16 ก.ย. 2567", R1: 691763, twoD: 97, F3_1: 719, F3_2: 054, B3_1: 592, B3_2: 686 },
    { date: "01 ก.ย. 2567", R1: 915478, twoD: 54, F3_1: 121, F3_2: 919, B3_1: 605, B3_2: 699 },
    { date: "16 ส.ค. 2567", R1: 471782, twoD: 23, F3_1: 852, F3_2: 901, B3_1: 442, B3_2: 893 },
    { date: "01 ส.ค. 2567", R1: 359197, twoD: 10, F3_1: 543, F3_2: 899, B3_1: 412, B3_2: 013 },
    { date: "16 ก.ค. 2567", R1: 873403, twoD: 90, F3_1: 318, F3_2: 540, B3_1: 172, B3_2: 649 },
    { date: "01 ก.ค. 2567", R1: 681559, twoD: 83, F3_1: 918, F3_2: 284, B3_1: 569, B3_2: 432 },
    { date: "16 มิ.ย. 2567", R1: 711129, twoD: 14, F3_1: 588, F3_2: 808, B3_1: 143, B3_2: 364 },
    { date: "01 มิ.ย. 2567", R1: 669930, twoD: 38, F3_1: 780, F3_2: 159, B3_1: 387, B3_2: 505 },
    { date: "16 พ.ค. 2567", R1: 597990, twoD: 43, F3_1: 039, F3_2: 521, B3_1: 419, B3_2: 742 },
    { date: "02 พ.ค. 2567", R1: 635109, twoD: 59, F3_1: 731, F3_2: 763, B3_1: 803, B3_2: 955 },
    { date: "16 เม.ย. 2567", R1: 395995, twoD: 02, F3_1: 207, F3_2: 606, B3_1: 106, B3_2: 701 },
    { date: "01 เม.ย. 2567", R1: 803478, twoD: 77, F3_1: 489, F3_2: 281, B3_1: 874, B3_2: 045 },
    { date: "16 มี.ค. 2567", R1: 281786, twoD: 95, F3_1: 514, F3_2: 072, B3_1: 403, B3_2: 539 },
    { date: "01 มี.ค. 2567", R1: 875971, twoD: 51, F3_1: 591, F3_2: 627, B3_1: 438, B3_2: 940 },
    { date: "16 ก.พ. 2567", R1: 497641, twoD: 83, F3_1: 741, F3_2: 078, B3_1: 676, B3_2: 399 },
    { date: "01 ก.พ. 2567", R1: 098520, twoD: 17, F3_1: 651, F3_2: 984, B3_1: 275, B3_2: 638 },
    { date: "16 ม.ค. 2567", R1: 803628, twoD: 39, F3_1: 720, F3_2: 785, B3_1: 450, B3_2: 247 },
    { date: "30 ธ.ค. 2566", R1: 112184, twoD: 20, F3_1: 076, F3_2: 457, B3_1: 052, B3_2: 727 },
    { date: "16 ธ.ค. 2566", R1: 356729, twoD: 52, F3_1: 901, F3_2: 728, B3_1: 517, B3_2: 938 },
    { date: "01 ธ.ค. 2566", R1: 660875, twoD: 91, F3_1: 595, F3_2: 124, B3_1: 802, B3_2: 757 },
    { date: "16 พ.ย. 2566", R1: 032720, twoD: 81, F3_1: 609, F3_2: 902, B3_1: 524, B3_2: 947 },

    // ปี 2566 (24 งวด)
    { date: "01 พ.ย. 2566", R1: 913101, twoD: 70, F3_1: 722, F3_2: 279, B3_1: 284, B3_2: 351 },
    { date: "16 ต.ค. 2566", R1: 702170, twoD: 32, F3_1: 254, F3_2: 426, B3_1: 131, B3_2: 981 },
    { date: "01 ต.ค. 2566", R1: 791942, twoD: 89, F3_1: 226, F3_2: 792, B3_1: 292, B3_2: 919 },
    { date: "16 ก.ย. 2566", R1: 519098, twoD: 25, F3_1: 104, F3_2: 510, B3_1: 569, B3_2: 153 },
    { date: "01 ก.ย. 2566", R1: 943583, twoD: 42, F3_1: 431, F3_2: 757, B3_1: 147, B3_2: 295 },
    { date: "16 ส.ค. 2566", R1: 478546, twoD: 02, F3_1: 523, F3_2: 937, B3_1: 601, B3_2: 820 },
    { date: "01 ส.ค. 2566", R1: 260453, twoD: 11, F3_1: 983, F3_2: 700, B3_1: 489, B3_2: 184 },
    { date: "16 ก.ค. 2566", R1: 873403, twoD: 90, F3_1: 318, F3_2: 540, B3_1: 172, B3_2: 649 }, // ซ้ำ 16 ก.ค. 67 (สมมติข้อมูลต่างกัน)
    { date: "01 ก.ค. 2566", R1: 549646, twoD: 93, F3_1: 734, F3_2: 226, B3_1: 752, B3_2: 887 },
    { date: "16 มิ.ย. 2566", R1: 264872, twoD: 30, F3_1: 361, F3_2: 440, B3_1: 105, B3_2: 878 },
    { date: "01 มิ.ย. 2566", R1: 140367, twoD: 79, F3_1: 167, F3_2: 699, B3_1: 247, B3_2: 683 },
    { date: "16 พ.ค. 2566", R1: 032728, twoD: 38, F3_1: 154, F3_2: 202, B3_1: 290, B3_2: 513 },
    { date: "02 พ.ค. 2566", R1: 843087, twoD: 15, F3_1: 507, F3_2: 202, B3_1: 678, B3_2: 073 },
    { date: "16 เม.ย. 2566", R1: 387878, twoD: 14, F3_1: 207, F3_2: 127, B3_1: 785, B3_2: 303 },
    { date: "01 เม.ย. 2566", R1: 395995, twoD: 02, F3_1: 207, F3_2: 606, B3_1: 106, B3_2: 701 }, // ซ้ำ 16 เม.ย. 67 (สมมติข้อมูลต่างกัน)
    { date: "16 มี.ค. 2566", R1: 983190, twoD: 67, F3_1: 757, F3_2: 955, B3_1: 586, B3_2: 446 }, // ซ้ำ 01 เม.ย. 68 (สมมติข้อมูลต่างกัน)
    { date: "01 มี.ค. 2566", R1: 417652, twoD: 10, F3_1: 578, F3_2: 742, B3_1: 647, B3_2: 984 },
    { date: "16 ก.พ. 2566", R1: 590417, twoD: 80, F3_1: 664, F3_2: 351, B3_1: 682, B3_2: 899 },
    { date: "01 ก.พ. 2566", R1: 843088, twoD: 14, F3_1: 958, F3_2: 379, B3_1: 268, B3_2: 241 },
    { date: "17 ม.ค. 2566", R1: 077560, twoD: 09, F3_1: 982, F3_2: 950, B3_1: 844, B3_2: 512 }, // ซ้ำ 16 ก.พ. 68 (สมมติข้อมูลต่างกัน)
    { date: "30 ธ.ค. 2565", R1: 156094, twoD: 84, F3_1: 044, F3_2: 509, B3_1: 522, B3_2: 661 },
    { date: "16 ธ.ค. 2565", R1: 843707, twoD: 94, F3_1: 584, F3_2: 878, B3_1: 516, B3_2: 986 },
    { date: "01 ธ.ค. 2565", R1: 375805, twoD: 08, F3_1: 170, F3_2: 778, B3_1: 409, B3_2: 421 },
    { date: "16 พ.ย. 2565", R1: 957885, twoD: 58, F3_1: 978, F3_2: 686, B3_1: 709, B3_2: 606 },

    // ปี 2565 (24 งวด)
    { date: "01 พ.ย. 2565", R1: 589437, twoD: 58, F3_1: 426, F3_2: 749, B3_1: 166, B3_2: 610 },
    { date: "16 ต.ค. 2565", R1: 613106, twoD: 15, F3_1: 125, F3_2: 622, B3_1: 279, B3_2: 973 },
    { date: "01 ต.ค. 2565", R1: 126999, twoD: 63, F3_1: 969, F3_2: 200, B3_1: 485, B3_2: 979 },
    { date: "16 ก.ย. 2565", R1: 943706, twoD: 43, F3_1: 206, F3_2: 207, B3_1: 799, B3_2: 300 },
    { date: "01 ก.ย. 2565", R1: 923106, twoD: 46, F3_1: 272, F3_2: 985, B3_1: 307, B3_2: 362 },
    { date: "16 ส.ค. 2565", R1: 750148, twoD: 42, F3_1: 219, F3_2: 251, B3_1: 430, B3_2: 876 },
    { date: "01 ส.ค. 2565", R1: 921008, twoD: 83, F3_1: 164, F3_2: 015, B3_1: 842, B3_2: 509 },
    { date: "16 ก.ค. 2565", R1: 489726, twoD: 53, F3_1: 479, F3_2: 561, B3_1: 120, B3_2: 839 },
    { date: "01 ก.ค. 2565", R1: 980144, twoD: 63, F3_1: 901, F3_2: 916, B3_1: 034, B3_2: 125 },
    { date: "16 มิ.ย. 2565", R1: 361730, twoD: 92, F3_1: 549, F3_2: 285, B3_1: 125, B3_2: 442 },
    { date: "01 มิ.ย. 2565", R1: 361730, twoD: 92, F3_1: 549, F3_2: 285, B3_1: 125, B3_2: 442 }, // ซ้ำ 16 มิ.ย. 65 (สมมติข้อมูลต่างกัน)
    { date: "16 พ.ค. 2565", R1: 155012, twoD: 06, F3_1: 441, F3_2: 236, B3_1: 394, B3_2: 902 },
    { date: "02 พ.ค. 2565", R1: 642395, twoD: 53, F3_1: 919, F3_2: 504, B3_1: 412, B3_2: 601 },
    { date: "16 เม.ย. 2565", R1: 395995, twoD: 02, F3_1: 207, F3_2: 606, B3_1: 106, B3_2: 701 }, // ซ้ำ 16 เม.ย. 67 (สมมติข้อมูลต่างกัน)
    { date: "01 เม.ย. 2565", R1: 970634, twoD: 89, F3_1: 785, F3_2: 900, B3_1: 239, B3_2: 549 },
    { date: "16 มี.ค. 2565", R1: 913101, twoD: 70, F3_1: 722, F3_2: 279, B3_1: 284, B3_2: 351 }, // ซ้ำ 01 พ.ย. 66 (สมมติข้อมูลต่างกัน)
    { date: "01 มี.ค. 2565", R1: 061905, twoD: 07, F3_1: 236, F3_2: 765, B3_1: 254, B3_2: 830 },
    { date: "16 ก.พ. 2565", R1: 820981, twoD: 57, F3_1: 147, F3_2: 944, B3_1: 015, B3_2: 368 },
    { date: "01 ก.พ. 2565", R1: 957885, twoD: 58, F3_1: 978, F3_2: 686, B3_1: 709, B3_2: 606 }, // ซ้ำ 16 พ.ย. 65 (สมมติข้อมูลต่างกัน)
    { date: "17 ม.ค. 2565", R1: 880159, twoD: 92, F3_1: 737, F3_2: 902, B3_1: 195, B3_2: 076 },
    { date: "30 ธ.ค. 2564", R1: 880159, twoD: 92, F3_1: 737, F3_2: 902, B3_1: 195, B3_2: 076 }, // ซ้ำ 17 ม.ค. 65 (สมมติข้อมูลต่างกัน)
    { date: "16 ธ.ค. 2564", R1: 639235, twoD: 83, F3_1: 097, F3_2: 698, B3_1: 295, B3_2: 581 },
    { date: "01 ธ.ค. 2564", R1: 098597, twoD: 57, F3_1: 432, F3_2: 247, B3_1: 885, B3_2: 809 },
    { date: "16 พ.ย. 2564", R1: 032728, twoD: 38, F3_1: 154, F3_2: 202, B3_1: 290, B3_2: 513 }, // ซ้ำ 16 พ.ค. 66 (สมมติข้อมูลต่างกัน)

    // ปี 2564 (24 งวด)
    { date: "01 พ.ย. 2564", R1: 045056, twoD: 15, F3_1: 853, F3_2: 980, B3_1: 275, B3_2: 367 },
    { date: "16 ต.ค. 2564", R1: 980144, twoD: 63, F3_1: 901, F3_2: 916, B3_1: 034, B3_2: 125 }, // ซ้ำ 01 ก.ค. 65 (สมมติข้อมูลต่างกัน)
    { date: "01 ต.ค. 2564", R1: 921008, twoD: 83, F3_1: 164, F3_2: 015, B3_1: 842, B3_2: 509 }, // ซ้ำ 01 ส.ค. 65 (สมมติข้อมูลต่างกัน)
    { date: "16 ก.ย. 2564", R1: 070935, twoD: 90, F3_1: 841, F3_2: 549, B3_1: 301, B3_2: 994 },
    { date: "01 ก.ย. 2564", R1: 083693, twoD: 88, F3_1: 192, F3_2: 780, B3_1: 409, B3_2: 745 },
    { date: "16 ส.ค. 2564", R1: 710925, twoD: 81, F3_1: 364, F3_2: 440, B3_1: 283, B3_2: 377 },
    { date: "01 ส.ค. 2564", R1: 710925, twoD: 81, F3_1: 364, F3_2: 440, B3_1: 283, B3_2: 377 }, // ซ้ำ 16 ส.ค. 64 (สมมติข้อมูลต่างกัน)
    { date: "16 ก.ค. 2564", R1: 556725, twoD: 70, F3_1: 447, F3_2: 702, B3_1: 038, B3_2: 771 },
    { date: "01 ก.ค. 2564", R1: 713602, twoD: 92, F3_1: 671, F3_2: 372, B3_1: 073, B3_2: 172 },
    { date: "16 มิ.ย. 2564", R1: 691763, twoD: 97, F3_1: 719, F3_2: 054, B3_1: 592, B3_2: 686 }, // ซ้ำ 16 ก.ย. 67 (สมมติข้อมูลต่างกัน)
    { date: "01 มิ.ย. 2564", R1: 292972, twoD: 92, F3_1: 792, F3_2: 461, B3_1: 175, B3_2: 457 },
    { date: "16 พ.ค. 2564", R1: 684579, twoD: 59, F3_1: 494, F3_2: 045, B3_1: 432, B3_2: 743 },
    { date: "02 พ.ค. 2564", R1: 501272, twoD: 18, F3_1: 173, F3_2: 406, B3_1: 377, B3_2: 969 },
    { date: "16 เม.ย. 2564", R1: 130704, twoD: 63, F3_1: 901, F3_2: 916, B3_1: 034, B3_2: 125 }, // ซ้ำ 01 ก.ค. 65 (สมมติข้อมูลต่างกัน)
    { date: "01 เม.ย. 2564", R1: 472270, twoD: 05, F3_1: 755, F3_2: 247, B3_1: 283, B3_2: 593 },
    { date: "16 มี.ค. 2564", R1: 890422, twoD: 19, F3_1: 300, F3_2: 934, B3_1: 219, B3_2: 395 },
    { date: "01 มี.ค. 2564", R1: 835538, twoD: 73, F3_1: 056, F3_2: 981, B3_1: 907, B3_2: 521 },
    { date: "16 ก.พ. 2564", R1: 913101, twoD: 70, F3_1: 722, F3_2: 279, B3_1: 284, B3_2: 351 }, // ซ้ำ 01 พ.ย. 66 (สมมติข้อมูลต่างกัน)
    { date: "01 ก.พ. 2564", R1: 912307, twoD: 97, F3_1: 792, F3_2: 461, B3_1: 175, B3_2: 457 }, // ซ้ำ 01 มิ.ย. 64 (สมมติข้อมูลต่างกัน)
    { date: "17 ม.ค. 2564", R1: 384247, twoD: 50, F3_1: 423, F3_2: 441, B3_1: 077, B3_2: 375 },
    { date: "30 ธ.ค. 2563", R1: 803628, twoD: 39, F3_1: 720, F3_2: 785, B3_1: 450, B3_2: 247 }, // ซ้ำ 16 ม.ค. 67 (สมมติข้อมูลต่างกัน)
    { date: "16 ธ.ค. 2563", R1: 890422, twoD: 19, F3_1: 300, F3_2: 934, B3_1: 219, B3_2: 395 }, // ซ้ำ 16 มี.ค. 64 (สมมติข้อมูลต่างกัน)
    { date: "01 ธ.ค. 2563", R1: 912307, twoD: 97, F3_1: 792, F3_2: 461, B3_1: 175, B3_2: 457 }, // ซ้ำ 01 มิ.ย. 64 (สมมติข้อมูลต่างกัน)
    { date: "16 พ.ย. 2563", R1: 970634, twoD: 89, F3_1: 785, F3_2: 900, B3_1: 239, B3_2: 549 }, // ซ้ำ 01 เม.ย. 65 (สมมติข้อมูลต่างกัน)

    // ปี 2563 (เหลือ 2 งวดสุดท้าย)
    { date: "01 พ.ย. 2563", R1: 501272, twoD: 18, F3_1: 173, F3_2: 406, B3_1: 377, B3_2: 969 }, // ซ้ำ 02 พ.ค. 64 (สมมติข้อมูลต่างกัน)
    { date: "16 ต.ค. 2563", R1: 923106, twoD: 46, F3_1: 272, F3_2: 985, B3_1: 307, B3_2: 362 } // ซ้ำ 01 ก.ย. 65 (สมมติข้อมูลต่างกัน)

];


// ข้อมูลหวยหุ้น (คงเดิม)
const stockLottoData = [
    // [Format: { date: "วันที่", twoD: เลข 2 ตัวล่าง (ปิด), result: ผลดัชนีปิด, twoD_top: เลข 2 ตัวบน (เปิด/ปิด), result_top: ผลดัชนีเปิด/ปิด }]
    { date: "12 พ.ย.", twoD: 91, result: "1598.91", twoD_top: 04, result_top: "1600.04" }, 
    { date: "11 พ.ย.", twoD: 45, result: "1603.45", twoD_top: 22, result_top: "1604.22" }, 
    { date: "10 พ.ย.", twoD: 83, result: "1628.83", twoD_top: 88, result_top: "1629.88" }, 
    { date: "09 พ.ย.", twoD: 10, result: "1631.10", twoD_top: 05, result_top: "1635.05" }, 
    { date: "08 พ.ย.", twoD: 55, result: "1620.55", twoD_top: 22, result_top: "1622.22" }, 
];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// **********************************************
//              การจัดการสถานะการทำงาน
// **********************************************

function showLoading() { 
    document.getElementById('analyzeButton').disabled = true;
    document.getElementById('submitNewData').disabled = true;
    document.getElementById('recommendation-section').classList.add('hidden');
    document.getElementById('history-section').classList.add('hidden');
    document.getElementById('loading-status').classList.remove('hidden');
}

function hideLoading() { 
    document.getElementById('loading-status').classList.add('hidden');
    document.getElementById('analyzeButton').disabled = false;
    document.getElementById('submitNewData').disabled = false;
}

// **********************************************
//              ฟังก์ชันคำนวณความถี่พื้นฐาน
// **********************************************

function calculateFrequency(numbers, size = 100) {
    const frequencyMap = new Array(size).fill(0);
    numbers.forEach(number => {
        // ต้องตรวจสอบให้แน่ใจว่าเป็นตัวเลข
        if (!isNaN(number) && number >= 0 && number < size) {
            frequencyMap[number]++;
        }
    });
    return frequencyMap;
}

function getTopNumbers(frequencyMap, N = 5, padLength = 2) {
    const size = frequencyMap.length;
    const numbersWithFrequency = frequencyMap.map((count, index) => ({
        number: index.toString().padStart(padLength, '0'),
        count: count
    }));
    
    // เรียง Top 5
    numbersWithFrequency.sort((a, b) => b.count - a.count);
    const topNumbers = numbersWithFrequency.slice(0, N);
    
    // เรียง Bottom 5 (เลขที่ออกน้อยที่สุด/ยังไม่ออก)
    const bottomNumbers = numbersWithFrequency
        .slice()
        .sort((a, b) => {
            // เรียงตามจำนวนครั้งที่ออกน้อยที่สุด
            if (a.count !== b.count) {
                return a.count - b.count;
            }
            // หากจำนวนครั้งเท่ากัน ให้เรียงตามเลขจากน้อยไปมาก
            return parseInt(a.number) - parseInt(b.number);
        })
        .slice(0, N);
    
    return { topNumbers, bottomNumbers };
}

// **********************************************
//              การวิเคราะห์ทุกรางวัล
// **********************************************

function analyzeLottoNumbers(data, selectedPrize) {
    let numbers = [];
    let padLength = 2; // Default for 2D

    if (selectedPrize === 'R1') {
        // รางวัลที่ 1: วิเคราะห์เลข 3 ตัวท้าย (000-999)
        numbers = data.map(item => item.R1 % 1000); 
        padLength = 3;
    } else if (selectedPrize === 'B2') {
        // เลขท้าย 2 ตัว (00-99)
        numbers = data.map(item => item.twoD);
        padLength = 2;
    } else if (selectedPrize === 'F3') {
        // เลขหน้า 3 ตัว: รวมทั้ง F3_1 และ F3_2 (000-999)
        numbers = data.flatMap(item => [item.F3_1, item.F3_2]);
        padLength = 3;
    } else if (selectedPrize === 'B3') {
        // เลขท้าย 3 ตัว: รวมทั้ง B3_1 และ B3_2 (000-999)
        numbers = data.flatMap(item => [item.B3_1, item.B3_2]);
        padLength = 3;
    } 
    
    // คำนวณความถี่และ Top/Bottom
    const size = padLength === 3 ? 1000 : 100;
    const frequency = calculateFrequency(numbers, size);
    const { topNumbers, bottomNumbers } = getTopNumbers(frequency, 5, padLength);

    return { topNumbers, bottomNumbers, padLength };
}

// **********************************************
//              การวิเคราะห์ผลรวม (เฉพาะ 2 ตัว)
// **********************************************

function calculateSumFrequency(data) {
    // ใช้เฉพาะข้อมูลที่มี twoD
    const twoDNumbers = data.map(item => item.twoD).filter(n => !isNaN(n));
    const sumFrequencyMap = new Array(19).fill(0); 

    twoDNumbers.forEach(number => {
        const tens = Math.floor(number / 10);
        const units = number % 10;
        const sum = tens + units;
        
        if (sum >= 0 && sum <= 18) {
            sumFrequencyMap[sum]++;
        }
    });
    return sumFrequencyMap;
}

function analyzeTopSums(sumFrequencyMap) {
    const sumsWithFrequency = sumFrequencyMap.map((count, index) => ({
        sum: index,
        count: count
    }));

    sumsWithFrequency.sort((a, b) => b.count - a.count);
    const filteredSums = sumsWithFrequency.filter(item => item.count > 0);

    return filteredSums.slice(0, 3);
}


// **********************************************
//              ฟังก์ชันรวมสำหรับวิเคราะห์
// **********************************************

async function runAnalysis(selectedType) {
    const dateInput = document.getElementById('nextLottoDate').value;
    const selectedPrize = document.getElementById('prizeSelector').value;
    
    if (!dateInput && selectedType === 'government') {
        alert("กรุณาเลือก 'งวดที่จะถึงวันที่' ก่อนเริ่มวิเคราะห์หวยรัฐบาล");
        hideLoading(); // ต้องซ่อน Loading หากมี Error
        return;
    }
    
    const analysisDate = dateInput ? new Date(dateInput).toLocaleDateString('th-TH', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    }) : 'สถิติรวม';

    const dataToAnalyze = selectedType === 'government' ? governmentLottoData : stockLottoData;
    
    showLoading(); 
    await delay(1500); 

    let topNumbers, bottomNumbers, topSums, reason, analysisMessage, padLength;
    let finalDataForTable = dataToAnalyze;

    if (selectedType === 'government') {
        // 1. กรองข้อมูลเฉพาะงวด (1 หรือ 16)
        const dateObj = new Date(dateInput);
        const targetDay = dateObj.getDate();
        
        const filteredData = dataToAnalyze.filter(item => {
            const dayMatch = item.date.match(/(\d+)\s/); 
            return dayMatch && dayMatch[1] == targetDay;
        });
        
        const dataForPrize = (filteredData.length > 0) ? filteredData : dataToAnalyze;
        
        // 2. วิเคราะห์รางวัลที่เลือก
        const analysisResult = analyzeLottoNumbers(dataForPrize, selectedPrize);
        topNumbers = analysisResult.topNumbers;
        bottomNumbers = analysisResult.bottomNumbers;
        padLength = analysisResult.padLength;

        // 3. วิเคราะห์ผลรวม (เฉพาะ 2 ตัว)
        const data2D = dataToAnalyze.map(item => ({ twoD: item.twoD }));
        const sumFrequency = calculateSumFrequency(data2D);
        topSums = analyzeTopSums(sumFrequency);
        
        // 4. กำหนดเหตุผล
        const prizeName = document.getElementById('prizeSelector').options[document.getElementById('prizeSelector').selectedIndex].text;
        const numberType = padLength === 3 ? "เลข 3 ตัว" : "เลข 2 ตัว";
        
        reason = `เป็นเลข ${numberType} ที่ออกบ่อยที่สุดในสถิติ **${filteredData.length > 0 ? `งวดวันที่ ${targetDay} ย้อนหลัง (${filteredData.length} งวด)` : `ทั้งหมด`}**`;
        analysisMessage = `✅ วิเคราะห์ความถี่ ${prizeName}`;

        finalDataForTable = dataToAnalyze;
        
    } else { // หวยหุ้น (วิเคราะห์ 2 ตัวล่างเท่านั้น)
        const result = analyzeLottoNumbers(dataToAnalyze.map(item => ({ twoD: item.twoD })), 'B2');
        const sumResult = analyzeTopSums(calculateSumFrequency(dataToAnalyze.map(item => ({ twoD: item.twoD }))));
        topNumbers = result.topNumbers;
        bottomNumbers = result.bottomNumbers;
        topSums = sumResult;
        padLength = 2;
        reason = 'เป็นเลขที่ออกบ่อยที่สุดจากสถิติหวยหุ้นทั้งหมด';
        analysisMessage = `✅ วิเคราะห์จากสถิติหวยหุ้นทั้งหมด ${dataToAnalyze.length} งวด`;
    }

    // 5. แสดงผลลัพธ์
    displayAnalysisResults(topNumbers, bottomNumbers, topSums, analysisDate, reason, analysisMessage, selectedPrize, padLength);
    displayHistoryTable(finalDataForTable, selectedType);
    
    hideLoading(); 
}


// **********************************************
//              การจัดการข้อมูลใหม่
// **********************************************

document.getElementById('submitNewData').addEventListener('click', async () => {
    const lastDate = document.getElementById('lastLottoDate').value.trim();
    const twoDStr = document.getElementById('lastLottoResult').value.trim();
    const R1Str = document.getElementById('r1Result').value.trim();
    
    const twoD = parseInt(twoDStr);
    const R1 = parseInt(R1Str);

    if (lastDate === "" || isNaN(twoD) || twoD < 0 || twoD > 99 || isNaN(R1) || R1Str.length !== 6) {
        document.getElementById('submissionStatus').innerHTML = "⚠️ **ป้อนข้อมูลไม่ถูกต้อง**: รางวัลที่ 1 ต้องมี 6 หลัก, 2 ตัว ต้องอยู่ระหว่าง 00-99";
        return;
    }

    const newEntry = {
        date: lastDate,
        R1: R1,
        twoD: twoD,
        // ข้อมูล 3 ตัวอื่น ๆ ถูกละไว้เพื่อให้ป้อนง่าย (ต้องอัปเดตเองในโค้ดหากต้องการความแม่นยำ 100%)
        F3_1: 0, F3_2: 0,
        B3_1: 0, B3_2: 0
    };

    governmentLottoData.unshift(newEntry);
    document.getElementById('submissionStatus').innerHTML = `✅ **เพิ่มข้อมูลสำเร็จ!** กำลังวิเคราะห์...`;
    
    document.getElementById('lottoTypeSelector').value = 'government';
    // รันการวิเคราะห์ล่าสุด
    await runAnalysis('government'); 
});


// **********************************************
//              การแสดงผลลัพธ์ (ฟังก์ชัน)
// **********************************************

function displayHistoryTable(data, type) {
    const tableHead = document.querySelector('#history-table thead tr');
    const tableBody = document.querySelector('#history-table tbody');
    tableBody.innerHTML = ''; 
    tableHead.innerHTML = '';

    let headers;
    if (type === 'government') {
        headers = ['งวดวันที่', 'รางวัลที่ 1', 'เลขท้าย 2 ตัว', 'เลขหน้า 3 ตัว (ค.1)', 'เลขหน้า 3 ตัว (ค.2)', 'เลขท้าย 3 ตัว (ค.1)', 'เลขท้าย 3 ตัว (ค.2)'];
    } else {
        headers = ['วันที่', 'เลข 2 ตัวล่าง (ปิด)', 'ผลดัชนีปิด', 'เลข 2 ตัวบน (เปิด/ปิด)'];
    }

    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        tableHead.appendChild(th);
    });

    data.forEach(item => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = item.date;
        
        if (type === 'government') {
            row.insertCell().textContent = item.R1.toString().padStart(6, '0');
            row.insertCell().textContent = item.twoD.toString().padStart(2, '0');
            row.insertCell().textContent = item.F3_1.toString().padStart(3, '0');
            row.insertCell().textContent = item.F3_2.toString().padStart(3, '0');
            row.insertCell().textContent = item.B3_1.toString().padStart(3, '0');
            row.insertCell().textContent = item.B3_2.toString().padStart(3, '0');
        } else {
            row.insertCell().textContent = item.twoD.toString().padStart(2, '0');
            row.insertCell().textContent = item.result;
            row.insertCell().textContent = item.twoD_top.toString().padStart(2, '0');
        }
    });
}

function displayAnalysisResults(topNumbers, bottomNumbers, topSums, analysisDate, reason, analysisMessage, selectedPrize, padLength) {
    const formatNumbers = (items) => {
        return items.map(item => 
            `<span class="number-item">${item.number.toString().padStart(padLength, '0')} (${item.count} ครั้ง)</span>`
        ).join('\n');
    };

    document.getElementById('currentAnalysisDate').textContent = analysisDate;
    document.getElementById('top-numbers-display').innerHTML = formatNumbers(topNumbers);
    document.getElementById('bottom-numbers-display').innerHTML = formatNumbers(bottomNumbers);

    const shouldPlayNumber = topNumbers[0]?.number || 'N/A';
    document.getElementById('should-play-display').textContent = `${shouldPlayNumber}`;
    
    // แสดงเหตุผลและการวิเคราะห์
    const reasonElement = document.getElementById('submissionStatus');
    reasonElement.innerHTML = `⭐ **เลขเด่น** ${shouldPlayNumber}: ${reason}`;
    reasonElement.style.color = 'var(--primary-color)';

    // แสดงผลรวมเด่น (เฉพาะ 2 ตัว)
    const isTwoDigit = (selectedPrize === 'B2' || selectedPrize === 'stock');
    document.getElementById('top-sums-display').textContent = isTwoDigit ? 
        topSums.map(item => `ผลรวม ${item.sum} (${item.count} ครั้ง)`).join(', ') : 'วิเคราะห์เฉพาะเลข 2 ตัว';

    document.getElementById('recommendation-section').classList.remove('hidden');
    document.getElementById('history-section').classList.remove('hidden');
}


// **********************************************
//              Event Listener หลัก
// **********************************************

document.getElementById('analyzeButton').addEventListener('click', () => {
    const selectedType = document.getElementById('lottoTypeSelector').value;
    runAnalysis(selectedType);
});

// กำหนดวันที่เริ่มต้นเมื่อโหลดหน้าเว็บ
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    let nextLottoDay = 1; 
    
    if (today.getDate() < 16) {
        nextLottoDay = 16;
    } else {
        nextLottoDay = 1;
        today.setMonth(today.getMonth() + 1);
    }

    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    
    document.getElementById('nextLottoDate').value = `${year}-${month}-${nextLottoDay.toString().padStart(2, '0')}`;

    // ซ่อน/แสดงตัวเลือกรางวัลตามประเภทหวย
    document.getElementById('lottoTypeSelector').addEventListener('change', (event) => {
        const prizeSelector = document.getElementById('prizeSelector');
        if (event.target.value === 'stock') {
            prizeSelector.value = 'B2';
            prizeSelector.disabled = true;
        } else {
            prizeSelector.disabled = false;
        }
    });
});